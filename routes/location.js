'use strict';

// core
const debug = require('debug')('APP:LOCATION');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');


let Route = module.exports = {};


/**
 *  @api {get} /public/locations Get the locations information
 *  @apiName  GetLocation
 *  @apiGroup Location
 *
 *  @apiParam {String} search  The search.
 *
 */
Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);
  // enter verification
  const rules = {
    name: 'min:1',
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  // defined an filter
  let filter = {};

  if (!_.isUndefined(input.name)) {
    filter.where.name = {
      $iLike: '%' + input.name + '%'
    };
  }

  // query OrderBy
  filter.order = [['id', 'ASC']];
  try {
    let result = await models.Location.findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }

};


/**
 *  @api {get} /public/locations/:locationId Get the location information
 *  @apiName  GetLocationShow
 *  @apiGroup Location
 *
 *  @apiParam {Number} locationId  The location unique ID.
 *
 */
Route.show = async function(req, res, next) {
  debug(`ENTER location show method!`);
  try {
    let filter = {
      where: {
        id: req.params.locationId,
      }
    };
    let result = await models.Location.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /public/locations/tree Get the location tree information
 *  @apiName  GetLocationTree
 *  @apiGroup Location
 */
Route.indexTree = async function(req, res, next) {
  debug(`ENTER indexByTree method!`);
  let filter = {
    hierarchy: true
  };

  try {
    let result = await models.Location.findAll(filter);
    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /public/locations Post the location information
 *  @apiName  PostLocation
 *  @apiGroup Location
 *
 */
Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  const rules = {
    name: 'required|min:1',
    parentId: 'integer|exists:Location,id',
    depth: 'min:0',
    order: 'min:1|integer'
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
    let result = await models.Location.create(input, {transaction: t});
    await t.commit();
    req.params.locationId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

/**
 *  @api {put} /public/locations/:locationId Put the location information
 *  @apiName  PutLocation
 *  @apiGroup Location
 */
Route.update = async function(req, res, next) {
  debug(`ENTER update method!`);
  const rules = {
    name: 'min:1',
    parentId: 'integer|exists:Location,id',
    depth: 'min:0',
    order: 'min:1|integer'
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
    let result = await models.Location.findById(req.params.locationId, {transaction: t});
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
 *  @api {delete} /public/locations/:locationId Delete the location information
 *  @apiName  DeleteLocation
 *  @apiGroup Location
 */
Route.destroy = async function(req, res, next) {
  let t = await models.sequelize.transaction();
  try {
    let result = await models.Location.findOne({
      where: {
        id: req.params.locationId
      },
      transaction: t,
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

