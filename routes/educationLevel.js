'use strict';

// core
const debug = require('debug')('APP:EDUCATION_LEVEL');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');

// method

let Route = module.exports = {};

/**
 *  @api {get} /education_levels Get all the education level information
 *  @apiName  GeteEducationLevels
 *  @apiGroup Education Level
 *
 *  @apiParam  {String} name   The Education Level name.
 *
 *  @apiSuccess {Number} id  Education level unique ID.
 *  @apiSuccess {String} name  Education level name.
 *  @apiSuccess {String} description  Education level description.
 *  @apiSuccess {Number} createdBy  This data created people,storing the user ID.
 *  @apiSuccess {Number} updatedBy   This data updated people,storing the user ID.
 *  @apiSuccess {Date}   createdAt     This  data created time.
 *  @apiSuccess {Date}   updatedAt     This  data updated time.
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "id": 12,
 *         "name": "大专",
 *         "description": "大专",
 *         "createdBy": null,
 *         "updatedBy": null,
 *         "createdAt": "2016-03-28T07:11:39.445Z",
 *         "updatedAt": "2016-03-28T07:11:39.445Z"
 *      }
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.index = async function(req, res, next) {
  debug('Enter index method!');
  debug('Enter verification!');

  const rules = {
    name: 'min:0'
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(input.name)) {
    filter.where.name = {
      $iLike: '%' + input.name + '%'
    }
  }

  filter.order = [['updatedAt', 'DESC']];

  try {
    let result = await models.EducationLevel.findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /education_levels/id Get the education level information
 *  @apiName  GeteEducationLevel
 *  @apiGroup Education Level
 *
 *  @apiSuccess {Number} id  Education level unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function(req, res, next) {
  debug('Enter show method!');

  let filter = {
    where: {
      id: req.params.id
    }
  };

  try {
    let result = await models.EducationLevel.findOne(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /education_levels Create the education level information
 *  @apiName  CreateEducationLevel
 *  @apiGroup Education Level
 *
 *  @apiSuccess {String} name  Education level name.
 *  @apiSuccess {String} description  Education level description.
 *
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.create = async function(req, res, next) {
  debug('Enter create method!');
  debug('Enter verification!');

  const rules = {
    name: 'required|min:1',
    description: 'min:0',
    order: 'min:0|integer'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();

  try {
    let result = await models.EducationLevel.create(input, {transaction: t});
    await t.commit();

    req.params.id = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {put} /education_levels/id Update the education level information
 *  @apiName  UpdateEducationLevel
 *  @apiGroup Education Level
 *
 *  @apiSuccess {String} name  Education level name.
 *  @apiSuccess {String} description  Education level description.
 *
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.update = async function(req, res, next) {
  debug('Enter update method!');
  debug('Enter verification!');

  const rules = {
    name: 'required|min:1',
    description: 'min:0',
    order: 'min:0|integer'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.id
    }
  };

  let t = await models.sequelize.transaction();

  try {
    let result = await models.EducationLevel.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(input, {transaction: t});
    await t.commit();

    req.params.id = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};


/**
 *  @api {delete} /education_levels/id Delete the education level information
 *  @apiName  DeleteEducationLevel
 *  @apiGroup Education Level
 *
 *  @apiSuccess {Number} ID  Education level ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.destroy = async function(req, res, next) {
  debug('Enter destroy method!');

  let filter = {
    where: {
      id: req.params.id
    }
  };

  try {
    let result = await models.EducationLevel.destroy(filter);

    return res.return();
  } catch (err) {
    return next(err);
  }
};

