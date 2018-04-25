'use strict';

// core
const debug = require('debug')('APP:SCHOOL');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');

// method

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  const rules = {
    search: 'min:0'
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(input.search)) {
    filter.where.name = {
      $iLike: '%' + input.search + '%'
    };
  }

  filter.order = [['name', 'ASC']];

  try {
    let result = await models.School.findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.indexByEducation = async function(req, res, next) {
  debug('Enter index method!');
  try {
    let result = await models.School.findAll();

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug('Enter show method!');

  let filter = {
    where: {
      id: req.params.schoolId
    }
  };

  try {
    let result = await models.School.findOne(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug('Enter create method!');

  const rules = {
    name: 'required|min:1',
    url: 'min:0',
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();

  try {
    let result = await models.School.create(input, {transaction: t});
    await t.commit();

    req.params.schoolId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.update = async function(req, res, next) {
  debug('Enter update method!');
  const rules = {
    name: 'required|min:1',
    url: 'min:0',
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.schoolId
    }
  };

  let t = await models.sequelize.transaction();

  try {
    let result = await models.School.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(input, {transaction: t});
    await t.commit();

    req.params.schoolId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /school/id Delete the education level information
 *  @apiName  DeleteSchool
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
      id: req.params.schoolId
    }
  };

  try {
    let result = await models.School.destroy(filter);

    return res.return();
  } catch (err) {
    return next(err);
  }
};

