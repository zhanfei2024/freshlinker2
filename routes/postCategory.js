'use strict';

// core
const debug = require('debug')('APP:POST_CATEGORY');


// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);
  const rules = {
    search: 'min:1',
    name: 'min:1',
    active: 'boolean',
    parentId: 'min:1'
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);
  if (!_.isUndefined(input.search) && input.search !== '') {
    filter.where.$or = {
      name: {
        $iLike: '%' + input.search + '%'
      }
    };
  }

  if (!_.isUndefined(input.parentId)) filter.where.parentId = input.parentId;
  if (!_.isUndefined(input.name)) filter.where.name = input.name;

  filter.order = [['order', 'ASC']];
  try {
    let result = await models.PostCategory.findAndCountAll(filter);
    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.indexTree = async function(req, res, next) {
  debug(`ENTER indexByTree method!`);
  let filter = {
    hierarchy: true
  };

  try {
    let result = await models.PostCategory.findAll(filter);
    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /post_categories/id Get the post category information
 *  @apiName  GetPostCategory
 *  @apiGroup PostCategory
 *
 *  @apiParam {Number} id  The post category unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);
  try {
    let result = await models.PostCategory.findById(req.params.categoryId);
    if (result === null) throw new MainError('common', 'notFound');
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /post_categories Create the post category information
 *  @apiName  CreatePostCategory
 *  @apiGroup PostCategory
 *
 *  @apiSuccess {Number} parentId  The post category parent Id.
 *  @apiSuccess {String} depth   The post category depth.
 *  @apiSuccess {String} name  The post category name.
 *  @apiSuccess {String} description  The post category description.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  const rules = {
    name: 'required|min:1',
    parentId: 'integer|exists:PostCategory,id',
    description: 'min:0',
    order: 'integer|min:0'
  };

  let input = validateHelper.pick(req.body, rules, [], ['parentId']);
  try {
    debug(input);
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    if (_.isNaN(parseInt(input.parentId))) delete input.parentId;
    let result = await models.PostCategory.create(input, {transaction: t});
    await t.commit();
    req.params.categoryId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

/**
 *  @api {put} /post_categories/id Update the post category information
 *  @apiName  UpdatePostCategory
 *  @apiGroup PostCategory
 *
 *  @apiParam {Number} id  The post category unique ID.
 *
 *  @apiSuccess {Number} parentId  The post category parent Id.
 *  @apiSuccess {String} depth   The post category depth.
 *  @apiSuccess {String} name  The post category name.
 *  @apiSuccess {String} description  The post category description.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.update = async function(req, res, next) {
  debug(`ENTER update method!`);
  const rules = {
    name: 'min:1',
    parentId: 'integer|exists:PostCategory,id',
    description: 'min:0',
    order: 'integer|min:0'
  };

  let input = validateHelper.pick(req.body, rules, [], ['parentId']);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    if (_.isNaN(parseInt(input.parentId))) delete input.parentId;
    let result = await models.PostCategory.findById(req.params.categoryId, {transaction: t});
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(input, {transaction: t});
    await t.commit();

    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /post_categories/id Delete the post category information
 *  @apiName  DeletePostCategory
 *  @apiGroup PostCategory
 *
 *  @apiParam {Number} id  The post category unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.destroy = async function(req, res, next) {
  debug(`ENTER destroy method!`);
  let t = await models.sequelize.transaction();
  try {
    let result = await models.PostCategory.findOne({where: {id: req.params.categoryId}, transaction: t});
    if (result === null) throw new MainError('common', 'notFound');
    await result.destroy({transaction: t});
    await t.commit();
    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

