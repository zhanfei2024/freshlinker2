'use strict';

// core
const debug = require('debug')('APP:PLAN');

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
  };
  let input = _.pick(req.query, Object.keys(rules));

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
      },
      displayName: {
        $iLike: '%' + input.search + '%'
      },
      description: {
        $iLike: '%' + input.search + '%'
      }
    };
  }

  filter.order = [['updatedAt', 'DESC']];

  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Plan.getAttributes(), ['updatedAt']);

  try {
    let result = await models.Plan.findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /plan/id(self) Get of the enterprise information
 *  @apiName  Get Plan
 *  @apiGroup Plan
 *
 *  @apiParam  {Number} id(self) Plans unique ID.
 *
 *  @apiError id The <code>id</code> of the Plan was not found.
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

  let filter = {
    where: {
      id: req.params.planId
    }
  };

  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Plan.getAttributes(), ['updatedAt']);

  try {
    let result = await models.Plan.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /plan Create of the enterprise information
 *  @apiName  Create Plan
 *  @apiGroup Plan
 *
 *  @apiParam {String} name  Plan name.
 *  @apiParam {String} displayNmae  Plan display name.
 *  @apiParam {String} meta   Plan joson.
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
    name: 'required',
    displayName: 'required',
    meta: 'required',
    description: 'min:1',
    active: 'boolean',
    features:'min:1',
  };

  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Plan.create(input, {transaction: t});
    await t.commit();

    req.params.planId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {put} /plan/id(self) Update of the enterprise information
 *  @apiName  Update Plan
 *  @apiGroup Plan
 *
 *  @apiParam  {Number} id(self) Plans unique ID.
 *
 *  @apiParam {String} name  Plan name.
 *  @apiParam {String} displayNmae  Plan display name.
 *  @apiParam {String} meta   Plan joson.
 *
 *  @apiError id The <code>id</code> of the Plan was not found.
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
    name: 'required',
    displayName: 'required',
    meta: 'required',
    description: 'min:1',
    active: 'boolean',
    features:'min:1',
  };
  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.planId
    }
  };

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Plan.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(input, {transaction: t});
    await t.commit();

    req.params.planId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /plan/id Delete of the enterprise information
 *  @apiName  Delete Plan
 *  @apiGroup Plan
 *
 *  @apiParam  {Number} id Plans unique ID.
 *
 *  @apiError id The <code>id</code> of the Plan was not found.
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
    let filter = {
      where: {
        id: req.params.planId
      },
      transaction: t
    };

    let planResult = await models.Plan.findOne(filter);
    if (planResult === null) throw new MainError('common', 'notFound');

    await planResult.destroy({transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};
