'use strict';

// core
const debug = require('debug')('APP:ADMIN');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');

let Route = module.exports = {};

/**
 *  @api {get} /admins Get all the admin information
 *  @apiName  GetAdmins
 *  @apiGroup Admin
 *
 *  @apiParam  {String} fristName  Admin frist name.
 *  @apiParam  {String} lastName   Admin last name.
 *
 *  @apiSuccess {String} fristName  Admin frist name.
 *  @apiSuccess {String} lastName   Admin last name.
 *  @apiSuccess {String} password  Admin password.
 *  @apiSuccess {Number} email  Admin email.
 *  @apiSuccess {Number} mobilePhone  Admin mobile phone.
 *  @apiSuccess {Number} homePhone  Admin home phone.
 *  @apiSuccess {Number}  createdBy  This data created people,storing the user ID.
 *  @apiSuccess {Number}  updatedBy   This data updated people,storing the user ID.
 *  @apiSuccess {Date}  createdAt     This  data created time.
 *  @apiSuccess {Date}  updatedAt     This  data updated time.
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "id": 1,
 *         "fristName": "Fei",
 *         "lastName": "Zheng",
 *         "password": "1231231231",
 *         "email": "123123123",
 *         "mobilePhone": "12312312",
 *         "homePhone": "3123123",
 *         "createdBy": null,
 *         "updatedBy": null,
 *         "createdAt": "2016-03-28T06:23:29.755Z",
 *         "updatedAt": "2016-03-28T06:23:29.755Z"
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
  const rules = {
    lastName: 'min:0',
    firstName: 'min:0'
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  // filter condition
  let filter = await res.paginatorHelper.initFilter(req.query);
  if (!_.isUndefined(input.lastName)) {
    filter.where.lastName = {
      $iLike: '%' + input.lastName + '%'
    };
  }
  if (!_.isUndefined(input.firstName)) {
    filter.where.firstName = {
      $iLike: '%' + input.firstName + '%'
    };
  }
  // query condition
  filter.order = [ [ 'updatedAt', 'DESC' ] ];

  try {
    let result = await models.Admin.findAndCountAll(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};


/**
 *  @api {get} /admins/id Get the admin information
 *  @apiName  GetAdmin
 *  @apiGroup Admin
 *
 *  @apiParam  {Number} id   The admin id.
 *
 *  @apiError ID The <code>ID</code> of the admin was not found. *
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
    let result = await models.Admin.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return res.item(result);
  } catch (err) {
    return next(err);
  }

};


/**
 *  @api {post} /admins Create the admin information
 *  @apiName  CreateAdmin
 *  @apiGroup Admin
 *
 *  @apiSuccess {Number} fristName  Admin frist name.
 *  @apiSuccess {Number} lastName   Admin last name.
 *  @apiSuccess {String} password  Admin password.
 *  @apiSuccess {Number} email  Admin email.
 *  @apiSuccess {Number} mobilePhone  Admin mobile phone.
 *  @apiSuccess {Number} homePhone  Admin home phone.
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
    lastName: 'required|min:1',
    firstName: 'required|min:1',
    password: 'required|min:6|max:16',
    email: 'required|email|min:6|max:32'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();

  try {
    let attributes = _.pick(req.body, models.Admin.getAttributes());

    let result = await models.Admin.create(attributes, {transaction: t});
    await t.commit();

    req.params.id = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};


/**
 *  @api {put} /admins/id Update the admin information
 *  @apiName  UpdateAdmin
 *  @apiGroup Admin
 *
 *  @apiParam {Number} id The admin id unique ID.
 *
 *  @apiSuccess {Number} fristName  Admin frist name.
 *  @apiSuccess {Number} lastName   Admin last name.
 *  @apiSuccess {String} password  Admin password.
 *  @apiSuccess {Number} email  Admin email.
 *  @apiSuccess {Number} mobilePhone  Admin mobile phone.
 *  @apiSuccess {Number} homePhone  Admin home phone.
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
    lastName: 'required|min:1',
    firstName: 'required|min:1',
    password: 'required|min:6|max:16',
    email: 'required|email|min:6|max:32'
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
    let result = await models.Admin.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    let attributes = _.pick(req.body, models.Admin.getAttributes());
    await result.updateAttributes(attributes, {transaction: t});
    await t.commit();

    req.params.id = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};


/**
 *  @api {delete} /admins/id Delete the admin information
 *  @apiName  DeleteAdmin
 *  @apiGroup Admin
 *
 *  @apiParam  {Number} id   The admin unique id.
 *
 *  @apiError ID The <code>ID</code> of the admin was not found. *
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
    let result = await models.Admin.destroy(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return res.return();
  } catch (err) {
    return next(err);
  }

};

