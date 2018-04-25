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
 *  @api {get} /country Get all the countrys information
 *  @apiName  GetCountrys
 *  @apiGroup Country
 *
 *
 *  @apiParam  {String} name   The country name.
 *
 *  @apiSuccess {Number} id  The Country unique ID.
 *  @apiSuccess {Number} parentId   The depth parent Id.
 *  @apiSuccess {Number} depth  The Country depth.
 *  @apiSuccess {String} code   The Country code.
 *  @apiSuccess {String} name  The Country name.
 *  @apiSuccess {Number}  createdBy  This data created people,storing the user ID.
 *  @apiSuccess {Number}  updatedBy   This data updated people,storing the user ID.
 *  @apiSuccess {Date}  createdAt     This  data created time.
 *  @apiSuccess {Date}  updatedAt     This  data updated time.
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "id": 1,
 *         "parentId": null,
 *         "depth": 1,
 *         "code": "AFG",
 *         "name": "Afghanistan"
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
    name: 'min:1'
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  // defined an filter
  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(input.name)) {
    filter.where.name = {
      $iLike: '%' + input.name + '%'
    };
  }

  // query Orderby
  filter.order = [['name', 'ASC']];

  try {
    let result = await models.Country.findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /country/id Get the countrys information
 *  @apiName  GetCountry
 *  @apiGroup Country
 *
 *  @apiParam  {Number} id    The country unique id.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function(req, res, next) {

  let filter = {
    where: {
      id: req.params.id
    }
  };

  try {
    let result = await models.Country.findOne(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }

};

/**
 *  @api {post} /country Create the country information
 *  @apiName  CreateCountry
 *  @apiGroup Country
 *
 *  @apiSuccess {Number} parentId   The depth parent Id.
 *  @apiSuccess {Number} depth  The Country depth.
 *  @apiSuccess {String} code   The Country code.
 *  @apiSuccess {String} name  The Country name.
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
    parentId: 'min:0|integer|exists:Country,id',
    depth: 'min:0|integer',
    code: 'required|min:1|max:5'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();

  try {
    let result = await models.Country.create(input, {transaction: t});

    await t.commit();
    req.params.id = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};


/**
 *  @api {put} /country/id Update the country information
 *  @apiName  UpdateCountry
 *  @apiGroup Country
 *
 *  @apiParam  {Number} id    The country unique id.
 *
 *  @apiSuccess {Number} parentId   The depth parent Id.
 *  @apiSuccess {Number} depth  The Country depth.
 *  @apiSuccess {String} code   The Country code.
 *  @apiSuccess {String} name  The Country name.
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
    parentId: 'min:0|integer|exists:Country,id',
    depth: 'min:0|integer',
    code: 'required|min:1|max:5'
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
    let result = await models.Country.findOne(filter);
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
 *  @api {delete} /country/id Delete the country information
 *  @apiName  DeleteCountry
 *  @apiGroup Country
 *
 *  @apiParam  {Number} id    The country unique id.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.destroy = async function(req, res, next) {
  let filter = {
    where: {
      id: req.params.id
    }
  };
  try {
    let result = await models.Country.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy(filter);
    await t.commit();

    return res.return();
  } catch (err) {
    return next(err);
  }
};
