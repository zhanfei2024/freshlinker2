'use strict';

// core
const debug = require('debug')('APP:COMPANY');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const moment = require('moment');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

/**
 *  @api {get} /currency Get all the currencys information
 *  @apiName  GetCurrencys
 *  @apiGroup Currency
 *
 *  @apiParam  {String} name   The currency name.
 *
 *  @apiSuccess {Number} id  The currency unique ID.
 *  @apiSuccess {String} code   The currency code.
 *  @apiSuccess {String} name  The currency name.
 *  @apiSuccess {String} symbol  The currency symbol.
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *        "id": 128,
 *         "code": "ZMW",
 *         "name": "Zambian Kwacha",
 *         "symbol": "$"
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
  // enter verification
  const rules = {
    name: 'min:0',
    code: 'min:0'
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

  if (!_.isUndefined(input.code)) {
    filter.where.code = {
      $iLike: '%' + input.code + '%'
    };
  }

  // query OrderBy
  filter.order = [ [ 'id', 'ASC' ] ];

  try {
    let result = await models.Currency.findAll(filter);

    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /currency/id Get the currency information
 *  @apiName  GetCurrency
 *  @apiGroup Currency
 *
 * @apiParam  {Number} id   The country unique id.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function (req, res, next) {

  let filter = {
    where: {
      id: req.params.id
    }
  };

  try {
    let result = await models.Currency.findOne(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }

};

/**
 *  @api {post} /currency Create the currency information
 *  @apiName  CreateCurrency
 *  @apiGroup Currency
 *
 *  @apiSuccess {String} code   The currency code.
 *  @apiSuccess {String} name  The currency name.
 *  @apiSuccess {String} symbol  The currency symbol.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.create = async function(req, res, next) {
  const rules = {
    name: 'required|min:1',
    code: 'required|min:1|max:5',
    symbol: 'min:0'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();

  try {
    let result = await models.Currency.create(input, {transaction: t});
    await t.commit();

    req.params.id = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {put} /currency/id Update the currency information
 *  @apiName  UpdateCurrency
 *  @apiGroup Currency
 *
 *  @apiParam  {Number} id   The country unique id.
 *
 *  @apiSuccess {String} code   The currency code.
 *  @apiSuccess {String} name  The currency name.
 *  @apiSuccess {String} symbol  The currency symbol.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.update = async function(req, res, next) {
  const rules = {
    name: 'required|min:1',
    code: 'required|min:1|max:5',
    symbol: 'min:0'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();

  let filter = {
    where: {
      id: req.params.id
    }
  };

  try {
    let result = await models.Currency.findOne(filter);
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
 *  @api {delete} /currency/id Delete the currency information
 *  @apiName  DeleteCurrency
 *  @apiGroup Currency
 *
 *  @apiParam  {Number} id   The country unique id.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.destroy = async function (req, res, next) {

  let filter = {
    where: {
      id: req.params.id
    }
  };

  try {
    let result = await models.Currency.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({where: {id: result.id}});

    return res.return();
  } catch (err) {
    return next(err);
  }
};









