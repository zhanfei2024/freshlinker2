'use strict';

// core
const debug = require('debug')('APP:USER_LANGUAGE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

/**
 *  @api {get} /users/self/languages Get all the languages information
 *  @apiName  GetUserLanguages
 *  @apiGroup UserLanguages
 *
 *
 *  @apiSuccess {String} userId   The user unique id.
 *  @apiSuccess {String} languageId   The language unique id.
 *  @apiSuccess {Number}  createdBy  This data created people,storing the user ID.
 *  @apiSuccess {Number}  updatedBy   This data updated people,storing the user ID.
 *  @apiSuccess {Date}  createdAt     This  data created time.
 *  @apiSuccess {Date}  updatedAt     This  data updated time.
 *
 */
Route.index = async function(req, res, next) {
  try {
    let filter = {
      where: {
        userId: req.params.userId
      }
    };
    let result = await models.UserLanguage.scope(['includeLanguage']).findAll(filter);
    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /users/self/languages/id Get the language information
 *  @apiName  GetUserLanguage
 *  @apiGroup UserLanguage
 *
 *  @apiParam  {Number} id   The language id.
 *
 *  @apiError ID The <code>ID</code> of the language was not found.
 *
 */
Route.show = async function (req, res, next) {
  try {

    let filter = {
      where: {
        id: req.params.languageId,
        userId: req.params.userId
      }
    };

    let result = await models.UserLanguage.scope(['includeLanguage']).findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /users/self/languages Create the language information
 *  @apiName  CreateUserLanguage
 *  @apiGroup UserLanguage
 *
 *  @apiSuccess {String} userId   The user unique id.
 *  @apiSuccess {String} languageId   The language unique id.
 *
 */
Route.create = async function(req, res, next) {
  debug('Enter create method!');

  const rules = {
    languageId: 'required|integer|exists:Language,id',
  };
  let input = _.pick(req.body, models.UserLanguage.getAttributes());

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    input.userId = req.params.userId;

    let user = await models.User.findById(input.userId, {transaction: t});
    if (user === null) throw new MainError('common', 'notFound');

    let check = await models.UserLanguage.findOne({
      where: {
        userId: input.userId,
        languageId: input.languageId
      }, transaction: t
    });
    if (check !== null) throw new MainError('user', 'existUserLanguage');

    let result = await models.UserLanguage.create(input, {transaction: t});
    await t.commit();
    req.params.languageId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {put} /users/self/languages/id Update the candidate information
 *  @apiName  UpdateUserLanguage
 *  @apiGroup UserLanguage
 *
 *  @apiParam {Number} id The language id unique ID.
 *
 *  @apiSuccess {String} userId   The user unique id.
 *  @apiSuccess {String} languageId   The language unique id.
 */
Route.update = async function(req, res, next) {
  debug(`ENTER update method`);
  const rules = {
    languageId: 'integer|exists:Language,id',
  };
  let input = _.pick(req.body, models.UserLanguage.getAttributes());

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.UserLanguage.findOne({
      where: {
        id: req.params.languageId,
        userId: req.params.userId,
      },
      transaction: t,
    });
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(input, {transaction: t});
    await t.commit();
    req.params.languageId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};


/**
 *  @api {delete} /users/self/languages/id Delete the language information
 *  @apiName  DeleteUserLanguage
 *  @apiGroup UserLanguage
 *
 *  @apiParam  {Number} id   The user language unique id.
 *
 */
Route.destroy = async function (req, res, next) {
  let t = await models.sequelize.transaction();
  try {
    let result = await models.UserLanguage.findOne({
      where: {
        id: req.params.languageId,
        userId: req.params.userId,
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

