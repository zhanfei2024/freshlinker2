'use strict';

// core
const debug = require('debug')('APP:POST_IMAGE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const path = require('path');
const randomstring = require("randomstring");

const s3 = require(__base + 'modules/s3');
const indicative = require('indicative');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  let filter = await res.paginatorHelper.initFilter(req.query);
  filter.where.postId = req.params.postId;
  filter.where.isCover = false;

  try {
    let result = await models.PostImage.findAndCountAll(filter);
    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug('Enter show method!');

  let filter = {
    where: {
      id: req.params.imageId,
      postId: req.params.postId,
      isCover: false,
    }
  };

  try {
    let result = await models.PostImage.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.showCover = async function(req, res, next) {
  debug('Enter showIcon method!');

  let filter = {
    where: {
      id: req.params.imageId,
      postId: req.params.postId,
      isCover: true,
    }
  };

  try {
    let result = await models.PostImage.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  debug('Enter destroy method!');
  let t = await models.sequelize.transaction();
  try {
    let result = await models.PostImage.findOne({
      where: {
        id: req.params.imageId,
        postId: req.params.postId,
      },
      transaction: t
    });
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({
      transaction: t
    });
    await t.commit();
    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

const uploadImage = async function(req, res, next) {
  debug('Enter upload picture method!');

  const rules = {
    file: 'array',
    'file.*': 'required|image',
  };
  rules['file.*'] = `${rules['file.*']}|dimensions:min_width=650,max_width=1024,min_height=420,max_height=1024`;
  let input = _.pick(req.files, Object.keys(rules));
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let post = await models.Post.findOne({where: {id: req.params.postId}, transaction: t});
    if (post === null) throw new MainError('common', 'notFound');

    let fileKey = randomstring.generate(24);
    let extname = path.extname(input.file[0].originalname).toLowerCase();
    let filename = path.basename(input.file[0].originalname, extname);
    // 文件存放在服务器的位置. ${extname}
    let cloudPath = `post/${post.id}/image/${fileKey}/original${extname}`;

    await s3.upload(input.file[0].path, cloudPath);

    // remove old cover if uploading cover
    if (req.body.isCover === true) {
      let postImage = await models.PostImage.findOne({
        where: {postId: post.id, isCover: true},
        transaction: t
      });
      if (postImage !== null) {
        await postImage.destroy({transaction: t});
      }
    }

    let postImageAttributes = {};
    postImageAttributes.postId = post.id;
    postImageAttributes.name = !_.isUndefined(req.body.name) ? req.body.name : filename;
    postImageAttributes.mime = input.file[0].mimetype;
    postImageAttributes.size = input.file[0].size;
    postImageAttributes.key = fileKey;
    postImageAttributes.isCover = req.body.isCover === true;
    postImageAttributes.extension = extname.substring(1);
    let result = await models.PostImage.create(postImageAttributes, {transaction: t});
    await t.commit();

    req.params.imageId = result.id;
    if (result.isCover) return Route.showCover(req, res, next);

    return Route.show(req, res, next);

  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.uploadCover = async function(req, res, next) {
  req.body.isCover = true;
  return uploadImage(req, res, next);
};

Route.uploadImage = async function(req, res, next) {
  req.body.isCover = false;
  return uploadImage(req, res, next);
};
