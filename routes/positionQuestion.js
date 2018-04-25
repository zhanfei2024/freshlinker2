'use strict';

// core
const debug = require('debug')('APP:POSITION_QUESTION');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

/**
 *  @api {get} /users/companies/self/positionQuestion/:positionId Get the position question information
 *  @apiName  GetPositionQuestion
 *  @apiGroup PositionQuestion
 *
 *  @apiParam {String} search  The search.
 *
 */
Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);
  const rules = {
    search: 'min:1',
    positionId: 'integer|exists:Position,id'
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(input.search) && input.search !== '') {
    filter.where.$or = {
      question: {
        $iLike: '%' + input.search + '%'
      }
    };
  }

  if (!_.isUndefined(input.positionId)) filter.where.positionId = input.positionId;

  filter.order = [['id', 'ASC']];
  try {
    let result = await models.PositionQuestion.findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }

};

/**
 *  @api {get} /companies/:companyId([0-9]+)/positions/:positionId([0-9]+)/questions Get the position question information
 *  @apiName  GetPositionQuestionShow
 *  @apiGroup PositionQuestion
 *
 *  @apiParam {Number} positionId  The position unique ID.
 *
 */
Route.show = async function (req, res, next) {
  debug(`ENTER show method!`);

  const rules = {
    positionId: 'integer|exists:Position,id'
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
        positionId: input.positionId
      }
    };

    let result = await models.PositionQuestion.findAll(filter);
    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /users/companies/self/positionQuestion/:positionId     Post the position question information
 *  @apiName  PostPositionQuestion
 *  @apiGroup PositionQuestion
 *
 */
Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  const rules = {
    positionId: 'required|min:1|exists:Position,id',
    question: 'min:1',
    isAttachment: 'boolean',
    isRequired: 'boolean',
  };

  let input = _.pick(req.body, models.PositionQuestion.getAttributes());

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let questionResult = await models.PositionQuestion.findAll({
      where: {positionId: input.positionId}
    });
    if (questionResult.length >= res.locals.setting.questionCount) throw new MainError('position', 'exceedMaxQuestion');

    let result = await models.PositionQuestion.create(input, {transaction: t});

    await t.commit();
    req.params.questionId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

/**
 *  @api {put} /users/companies/self/positionQuestion/:positionId Put the position question information
 *  @apiName  PutPositionQuestion
 *  @apiGroup PositionQuestion
 */
Route.update = async function(req, res, next) {
  debug(`ENTER update method!`);
  const rules = {
    positionId: 'required|min:1|exists:Position,id',
    question: 'min:1',
    isAttachment: 'boolean',
    isRequired: 'boolean',
  };

  let input = _.pick(req.body, models.PositionQuestion.getAttributes());

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.PositionQuestion.findOne({
      where: {
        id: req.params.questionId,
        positionId: input.positionId,
      },
      transaction: t,
    });
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
 *  @api {delete} /users/questions/positions/:positionId([0-9]+) Delete the position question information
 *  @apiName  DeletePositionQuestion
 *  @apiGroup PositionQuestion
 */
Route.destroy = async function (req, res, next) {
  let t = await models.sequelize.transaction();
  try {
    let result = await models.PositionQuestion.destroy({
      where: {
        id: req.params.questionId
      },
      transaction: t,
    });
    if (result === null) throw new MainError('common', 'notFound');

    await t.commit();
    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

