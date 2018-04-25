'use strict';

// core
const debug = require('debug')('APP:LANGUAGE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

/**
 *  @api {get} /languages Get all the languages information
 *  @apiName  GetLanguages
 *  @apiGroup Languages
 *
 *
 *  @apiSuccess {String} code  Language code.
 *  @apiSuccess {String} name   Language name.
 *  @apiSuccess {Boolean} default  Default value.
 *  @apiSuccess {Number}  createdBy  This data created people,storing the user ID.
 *  @apiSuccess {Number}  updatedBy   This data updated people,storing the user ID.
 *  @apiSuccess {Date}  createdAt     This  data created time.
 *  @apiSuccess {Date}  updatedAt     This  data updated time.
 *
 *  @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *     {
 *         "id": 1,
 *         "code": 'zh-cn',
 *         "name": '简体中文',
 *         "default": false,
 *         "createdBy": null,
 *         "updatedBy": null,
 *         "createdAt": "2016-03-28T06:23:29.755Z",
 *         "updatedAt": "2016-03-28T06:23:29.755Z"
 *      }
 *
 */
Route.index = async function(req, res, next) {
  try {
    let result = await models.Language.findAll();
    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /languages/id Get the language information
 *  @apiName  GetLanguage
 *  @apiGroup Language
 *
 *  @apiParam  {Number} id   The language id.
 *
 *  @apiError ID The <code>ID</code> of the language was not found.
 *
 */
Route.show = async function (req, res, next) {
  let t = await models.sequelize.transaction();
  try {
    let result = await models.Language.findOne({where: {id: req.params.languageId}, transaction: t});
    await t.commit();
    return res.item(result);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {post} /languages Create the language information
 *  @apiName  CreateLanguage
 *  @apiGroup Language
 *
 *  @apiSuccess {String} code  Language code.
 *  @apiSuccess {String} name   Language name.
 *  @apiSuccess {Boolean} default  Default value.
 *
 */
Route.create = async function(req, res, next) {
  debug('Enter create method!');

  //TODO code should unique
  const rules = {
    name: 'min:1',
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Language.create(input, {transaction: t});
    await t.commit();
    req.params.languageId = result.languageId;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {put} /languages/id Update the candidate information
 *  @apiName  UpdateLanguage
 *  @apiGroup Language
 *
 *  @apiParam {Number} id The language id unique ID.
 *
 *  @apiSuccess {String} code  Language code.
 *  @apiSuccess {String} name   Language name.
 *  @apiSuccess {Boolean} default  Default value.
 */
Route.update = async function(req, res, next) {
  const rules = {
    name: 'min:1',
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Language.findById(req.params.languageId, {transaction: t});
    if (result === null) throw new MainError('common', 'notFound');
    await result.updateAttributes(attributes, {transaction: t});
    await t.commit();
    req.params.languageId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /languages/id Delete the language information
 *  @apiName  DeleteLanguage
 *  @apiGroup Language
 *
 *  @apiParam  {Number} id   The language unique id.
 *
 *
 *  @apiError ID The <code>ID</code> of the candidate was not found.
 *
 */
Route.destroy = async function (req, res, next) {
  let t = await models.sequelize.transaction();
  try {
    let result = await models.Language.destroy({where: {id: req.params.languageId}, transaction: t});
    if (result === null) throw new MainError('common', 'notFound');
    await t.commit();
    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

