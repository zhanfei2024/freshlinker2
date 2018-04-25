'use strict';

// core
const debug = require('debug')('APP:COMMENT');
const fs = require('fs');

// model
const models = require(__base + 'models');
const randomstring = require("randomstring");
const commonConfig = require(__base + 'config/common');
const s3 = require(__base + 'modules/s3');

// library
const _ = require('lodash');
const moment = require('moment');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.read = async function(req, res, next) {
  debug(`ENTER read method!`);

  const rules = {
    toUserId: 'integer',
    isRead:'boolean'
  };

  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {where:{}};
  let scopes = ['includeUser'];

  if (!_.isUndefined(input.toUserId)) filter.where.toUserId = {$eq: input.toUserId};
  if (!_.isUndefined(input.isRead)) filter.where.isRead = input.isRead;

  try {
    let result = await models.Comment.scope(scopes).findAll(filter);

    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);

  const rules = {
    userId: 'integer',
  };

  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);
  let scopes = ['includeUser','includeComment'];

  if (!_.isUndefined(input.userId)){
    filter.where.$or = {
      toUserId: {
        $eq: input.userId
      },
      userId:{
        $eq: input.userId
      }
    };
    scopes.push('includePost','includeToUser');
  }
  if (!_.isUndefined(req.params.postId)) {
    filter.where.objectType = 'Post';
    filter.where.objectId = req.params.postId;
    scopes.push('includeCommentLike');
  }
  if (!_.isUndefined(req.params.commentId)) {
    filter.where.objectType = 'Comment';
    filter.where.objectId = req.params.commentId;
  }
  filter.order = [['totalLike','DESC'],['totalReply','DESC']];
  try {
    let result = await models.Comment.scope(scopes).findAndCountAll(filter);
    result.count = await models.Comment.count({where:filter.where});

    let allPromise = result.rows.map((row)=>{
      return new Promise((resolve)=>{
        if(!row.isRead && input.userId) row.updateAttributes({isRead:true});
        resolve();
      });
    });

    await Promise.all(allPromise);
    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);

  try {
    let result = await models.Comment.scope(['includeUser','includeComment','includeCommentLike']).findById(req.params.commentId);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);

  const rules = {
    userId: 'min:1|integer|exists:User,id',
    toUserId: 'min:1|integer|exists:User,id',
    content: 'required|min:1',
    objectType: 'min:1|in:Post,Comment',
    objectId: 'min:1|integer|exists:Comment,Post,id',
    postId: 'min:1|integer'
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    if (!_.isUndefined(input.content)) input.content = await Route.imageBase64CovertUrl(input.content);

    if (!_.isUndefined(req.params.postId) && _.isUndefined(req.params.commentId)) {
      input.objectType = 'Post';
      input.objectId = req.params.postId;
      input.postId = req.params.postId;
      let result = await models.Post.findOne({
        where: {
          id: req.params.postId,
          isApproved: true,
          active: true
        }
      });
      if (result === null) throw new MainError('common', 'notFound');
      await result.updateAttributes({totalComment: (result.totalComment + 1)}, {transaction: t});
      input.toUserId = result.userId;
    } else {
      input.objectType = 'Comment';
      input.objectId = req.params.commentId;

      let result = await models.Comment.findOne({where: {id: req.params.commentId}});

      if (result === null) throw new MainError('common', 'notFound');
      // if (result.objectType === 'Comment') throw new MainError('comment', 'commentNotEdit');
      await result.updateAttributes({totalReply: (result.totalReply + 1)}, {transaction: t});

      input.toUserId = result.userId;
    }

    let result = await models.Comment.create(input, {transaction: t});

    await t.commit();

    req.params.commentId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

Route.update = async function(req, res, next) {
  debug(`ENTER update method!`);

  let filter = {
    where:{
      id : req.params.commentId,
      toUserId: req.query.userId
    }
  };

  try {
    let result = await models.Comment.findOne(filter);

    if(!result) throw new MainError('common', 'notFound');

    await result.updateAttributes({isRead: true});

    return res.return();
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  debug(`ENTER destroy method!`);

  let t = await models.sequelize.transaction();
  try {
    let filter = {
      where: {
        id: req.params.commentId
      },
      transaction: t
    };

    let result = await models.Comment.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.like = async function (req, res, next) {
  debug('ENTER like method!');

  let rules = {
    userId: 'min:1|integer|exists:User,id',
    commentId: 'required|integer|exists:Comment,id,objectType,Post',
  };

  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Comment.findById(input.commentId);

    if (result === null) throw new MainError('common', 'notFound');
    if (result.userId === input.userId) throw new MainError('comment', 'commentNotEdit');

    let commentLike = await models.CommentLike.findOne({
      where: input,
    });
    if (commentLike !== null) {
      await commentLike.destroy({ transaction: t });
      await result.updateAttributes({ totalLike: (result.totalLike - 1) });
    } else {
      await models.CommentLike.create(input, { transaction: t });
      await result.updateAttributes({ totalLike: (result.totalLike + 1) });
    }
    await t.commit();

    req.params.commentId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.imageBase64CovertUrl = async function(content) {
  debug('Image base64 covert url');

  try {
    // get image base64 data
    let src = content.match(/<img.*?src="(data:image\/.*?;base64,.*?)".*?>/g);
    if (!_.isNull(src)) {
      let datas = [];

      for (let i = 0; i < src.length; i++) {
        let dataSrc = src[i].replace(/^<img.*?src="data:image\/.*?;base64,/, '');
        let data = dataSrc.replace(/["]/g, '');
        let fileKey = randomstring.generate(24);
        let imagePath = __base + `.tmp/${fileKey}.png`;
        // image base64 convert
        fs.writeFileSync(imagePath, data, {encoding: 'base64'}, function (err) {
          //Finished
          if (err) throw new MainError('common', 'notFound');
        });
        let cloudPath = `static/${moment().format('YYYY')}/${moment().format('MM')}/${fileKey}.png`;
        await s3.upload(imagePath, cloudPath);
        // 替换内容
        datas.push(src[i].replace(/src="(data:image\/.*?;base64,.*?)"/, `src="${commonConfig.sourceUrl}/files/w1024/${cloudPath}"`));
        // 删除文件
        fs.unlinkSync(imagePath);
      }

      // 替换内容
      if (datas.length > 0) {
        let i = 0;
        let newContent = content.replace(/<img.*?src="(data:image\/.*?;base64,.*?)".*?>/gi, function () {
          return datas[i++];
        });
        content = newContent;
      }
    }
    return Promise.resolve(content);
  } catch (err) {
    return Promise.reject(err);
  }
};
