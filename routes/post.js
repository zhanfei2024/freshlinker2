'use strict';

// core
const debug = require('debug')('APP:POST');

const fs = require('fs');
const xlsx = require('node-xlsx');

// model
const models = require(__base + 'models');
const path = require('path');
const randomstring = require("randomstring");
const commonConfig = require(__base + 'config/common');
const s3 = require(__base + 'modules/s3');


// library
const _ = require('lodash');
const moment = require('moment');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const tag = require(__base + 'methods/tag');
const stringHelper = require(__base + 'helpers/StringHelper');

let Route = module.exports = {};

Route.index = async function (req, res, next) {

  const rules = {
    search: 'min:1',
    companyId: 'integer',
    userId: 'integer',
    categoryIds: 'array',
    'categoryIds.*': 'integer',
    isApproved: 'boolean',
    active: 'boolean',
    sorting: 'in:featured,newest,popular',
    tags: 'min:1',
  };
  let input = validateHelper.pick(req.query, rules, ['categoryIds.*']);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let scopes = ['includeCover', 'includeUser', 'includeCategories'];
    let filter = {where: {}};
    let orderFilter = await res.paginatorHelper.initFilter(req.query);
    if (!_.isUndefined(input.search)) {
      filter.where.$or = {
        slug: {
          $iLike: '%' + input.search + '%'
        }
      };
    }

    if (!_.isUndefined(input.tags)) {
      let key = input.tags.split(',');
      let orCondition = [];
      _.each(key, function (str) {
        str = stringHelper.slugify(str);
        orCondition.push({
          slug: {
            $iLike: `%${str}%`
          }
        })
      });
      let tagResult = await models.Tag.findAll({
        attributes: ['id'],
        where: {
          $or: orCondition
        }
      });
      scopes.push({method: ['includePostTagsWithSearch', tagResult]});
    }

    if (!_.isUndefined(input.userId)) filter.where.userId = {$eq: input.userId};
    if (!_.isUndefined(input.companyId)) filter.where.companyId = {$eq: input.companyId};
    if (!_.isUndefined(input.isApproved)) filter.where.isApproved = input.isApproved;
    if (!_.isUndefined(input.active)) filter.where.active = input.active;
    if (!_.isUndefined(input.categoryIds)) scopes.push({method: ['includeCategoriesWithSearch', input.categoryIds]});

    if (!_.isUndefined(input.sorting)) {
      scopes.push({method: ['sorting', input.sorting]});
    } else {
      filter.order = [['updatedAt', 'DESC']];
    }
    orderFilter.attributes = filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Post.getAttributes(), ['updatedAt']);
    orderFilter.where = filter.where;

    let result = await models.Post.scope(scopes).findAndCountAll(orderFilter, {raw: true});
    let posts = await models.Post.scope(scopes).findAll(filter);
    result.count = posts.length;

    return res.paginatorWithCount(result, {}, orderFilter);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /users/id(self) Get of the user information
 *  @apiName  Get Post
 *  @apiGroup Post
 *
 *  @apiParam  {Number} id(self) Posts unique ID.
 *
 *  @apiError id The <code>id</code> of the Post was not found.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function (req, res, next) {
  debug(`ENTER show method!`);

  const rules = {
    companyId: 'integer',
    userId: 'integer',
    isApproved: 'boolean',
    active: 'boolean',
  };

  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.postId,
    }
  };

  let scopes = ['includeCover', 'includeCategories', 'includePostTags', 'includeUser', 'includeCompany'];

  if (!_.isUndefined(input.userId)) filter.where.userId = {$eq: input.userId};
  if (!_.isUndefined(input.companyId)) filter.where.companyId = {$eq: input.companyId};
  if (!_.isUndefined(input.isApproved)) filter.where.isApproved = input.isApproved;
  if (!_.isUndefined(input.active)) filter.where.active = input.active;

  try {
    let result = await models.Post.scope(scopes).findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /users Create of the user information
 *  @apiName  Create Post
 *  @apiGroup Post
 *
 *  @apiParam {String} lastName  Post last name.
 *  @apiParam {String} firstName  Post first name.
 *  @apiParam {String} username   Post name.
 *  @apiParam {String}  mobilePhone  Post mobile phone.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.create = async function (req, res, next) {
  debug(`ENTER create method!`);

  const rules = {
    companyId: 'min:1',
    userId: 'min:1|integer|exists:User,id',
    title: 'required|min:1',
    content: 'required|min:1',
    cover: 'url',
    url: 'url',
    tags: 'array',
    'tags.*.name': 'requiredIf:tags|min:1',
    categoryIds: 'array',
    'categoryIds.*': 'integer',
  };

  let input = validateHelper.pick(req.body, rules, ['tags.*', 'categoryIds.*']);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {

    if (!_.isUndefined(input.title)) input.slug = stringHelper.slugify(input.title);

    if (!_.isUndefined(input.content))
      input.content = await Route.imageBase64CovertUrl(input.content);

    let result = await models.Post.create(input, {transaction: t});

    if (!_.isUndefined(input.categoryIds)) {
      let categories = await models.PostCategory.findAllByIdAndFilterHasNotChildren(input.categoryIds);
      if (categories.length !== input.categoryIds.length) throw new MainError('post', 'postCategoryNotExists');
      await result.setCategories(categories, {transaction: t});
    }

    if (!_.isUndefined(input.tags)) await tag.retag('PostTag', result.id, _.map(input.tags, 'name'));

    await t.commit();

    req.params.postId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

Route.update = async function (req, res, next) {
  debug(`ENTER update method!`);

  const rules = {
    companyId: 'min:1',
    userId: 'min:1|integer|exists:User,id',
    title: 'min:1',
    content: 'min:1',
    isApproved: 'boolean',
    isFeatured: 'boolean',
    active: 'boolean',
    cover: 'url',
    url: 'url',
    tags: 'array',
    'tags.*.name': 'requiredIf:tags|min:1',
    categoryIds: 'array',
    'categoryIds.*': 'integer',
  };
  let input = validateHelper.pick(req.body, rules, ['tags.*', 'categoryIds.*']);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.postId
    }
  };

  let t = await models.sequelize.transaction();

  try {
    let result = await models.Post.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    if (!_.isUndefined(input.categoryIds)) {
      let categories = await models.PostCategory.findAllByIdAndFilterHasNotChildren(input.categoryIds);
      if (categories.length !== input.categoryIds.length) throw new MainError('post', 'postCategoryNotExists');
      await result.setCategories(categories, {transaction: t});
    }

    if (!_.isUndefined(input.title)) input.slug = stringHelper.slugify(input.title);

    if (!_.isUndefined(input.content))
      input.content = await Route.imageBase64CovertUrl(input.content);

    await result.updateAttributes(_.omit(input, ['categoryIds', 'tags']), {transaction: t});

    if (!_.isUndefined(input.tags)) await tag.retag('PostTag', result.id, _.map(input.tags, 'name'));

    let companyFilter = {where:{id:input.companyId},attributes: ['id', 'name', 'isVIP']};

    let company = await models.Company.findOne(companyFilter);

    if (company !== null && company.isVIP && input.isApproved) {
      let data = {
        companyId: company.id,
        postId: result.id,
        title: `${company.name}`,
      };

      await models.CompanyDynamic.create(data, {transaction: t});
    }

    await t.commit();

    req.params.postId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.destroy = async function (req, res, next) {
  let t = await models.sequelize.transaction();
  try {

    let filter = {
      where: {
        id: req.params.postId
      },
      transaction: t
    };

    let result = await models.Post.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.clickTraffic = async function (req, res, next) {
  debug('ENTER click traffic method!');

  try {
    let result = await models.Post.findById(req.params.postId);
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes({view: (result.view + 1)});

    return res.return();
  } catch (err) {
    return next(err);
  }
};

Route.imageBase64CovertUrl = async function (content) {
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

Route.export = async function (req, res, next) {
  debug('Enter export method!');

  try {
    let result = await models.Post.findAll({order: [['id', 'ASC']]});

    let data = [];
    result.forEach((val) => {
      val = val.toJSON();
      if (data.length === 0) {
        data.push(Object.keys(val));
      }

      let post = Object.values(val);
      data.push(post);
    });

    let path = __base + 'backend/assets/post.xlsx';
    let buffer = xlsx.build([{name: 'post', data: data}]);
    fs.writeFileSync(path, buffer, 'binary');
    res.item('./assets/post.xlsx');
  } catch (err) {
    next(err);
  }
}
