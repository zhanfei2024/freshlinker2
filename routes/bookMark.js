'use strict';

// core
const debug = require('debug')('APP:BOOK_MARK');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

/**
 *  @api {get} /users/self/bookMark/positions Get all the bookMark information
 *  @apiName  GetBookmarks
 *  @apiGroup Bookmark
 *
 *  @apiParam {Number} userId  The user unique ID.
 *
 *
 */
Route.index = async function(req, res, next) {
  debug('Enter index method!');

  const rules = {
    search: 'min:1',
    userId: 'integer|exists:User,id',
    positionId: 'integer|exists:Position,id,active,true'
  };
  req.query = validateHelper.attributeParseType(req.query, rules);
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }
  let scopes = [];
  let orderScopes = [];
  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(input.userId)) filter.where.userId = input.userId;
  if (!_.isUndefined(input.positionId)) filter.where.positionId = input.positionId;
  if (!_.isUndefined(input.search)) {
    scopes.push({method: ['includePositionWithSearch', input.search]});
    orderScopes.push({method: ['includePositionWithSearch', input.search]});
  } else {
    scopes.push('includePosition');
  }

  try {
    let result = await models.Bookmark.scope(scopes).findAndCountAll(filter);
    result.count = await models.Bookmark.scope(orderScopes).count({where:filter.where});

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /users/self/positions/:positionId([0-9]+)/bookmark` Get the bookMark information
 *  @apiName  GetBookmark
 *  @apiGroup Bookmark
 *
 *  @apiSuccess {Number} positionId   The position unique ID.
 *  @apiSuccess {Number} userId  The user unique ID.
 *
 *
 */
Route.show = async function(req, res, next) {
  const rules = {
    positionId: 'required|integer|exists:Position,id,active,true',
    userId: 'required|integer|exists:User,id',
  };

  let input = validateHelper.pick(req.params, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let filter = {
      where: {
        userId: req.params.userId,
        positionId: req.params.positionId
      }
    };
    let result = await models.Bookmark.findOne(filter);
    if (result === null) {
      result = {bookmarkStatus: false};
    } else {
      result.dataValues.bookmarkStatus = true;
    }
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /users/self/bookMark/positions/ Create the bookMark information
 *  @apiName  CreateBookmark
 *  @apiGroup Bookmark
 *
 *  @apiSuccess {Number} positionId   The position unique ID.
 *  @apiSuccess {Number} userId  The user unique ID.
 */
Route.create = async function(req, res, next) {
  const rules = {
    positionId: 'required|integer|exists:Position,id,active,true',
    userId: 'required|integer|exists:User,id',
  };

  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    await models.Bookmark.findOrCreate({
      where: input,
      transaction: t
    });
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {post} /users/self/bookMark/:bookMarkId/positions/ Delete the bookMark information
 *  @apiName  DeleteBookmark
 *  @apiGroup Bookmark
 *
 */
Route.destroy = async function(req, res, next) {
  const rules = {
    positionId: 'required|integer|exists:Position,id,active,true',
    userId: 'required|integer|exists:User,id',
  };

  let input = validateHelper.pick(req.params, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }
  let t = await models.sequelize.transaction();
  try {
    let result = await models.Bookmark.findOne({
      where: {
        userId: input.userId,
        positionId: input.positionId,
      }
    });
    if (result === null) throw new MainError('common', 'notFound');
    await result.destroy({transaction: t});
    await t.commit();
    return res.return();
  } catch (err) {
    return next(err);
  }

};
