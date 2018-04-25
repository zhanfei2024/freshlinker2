'use strict';

// core
const debug = require('debug')('APP:BILLS');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};


Route.index = async function (req, res, next) {
  debug('Enter index method!');

  const rules = {
    enterpriseId: 'integer|exists:Enterprise,id,active,true',
    type: 'min:1|in:invitation,liberties',
    startedDate: 'date',
    endedDate: 'date',
  };
  let input = validateHelper.pick(req.query, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(input.enterpriseId)) filter.where.enterpriseId = input.enterpriseId;
  if (!_.isUndefined(input.type)) filter.where.type = input.type;
  if (!_.isUndefined(input.startedDate)) filter.where.updatedAt = {$gte: input.startedDate};
  if (!_.isUndefined(input.endedDate)) filter.where.updatedAt = {$lte: input.endedDate};

  filter.order = [
    ['billedAt', 'DESC']
  ];
  try {
    let result = await models.Bills.scope(['includeEnterprise']).findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function (req, res, next) {
  debug('Enter delete method!');

  const rules = {
    enterpriseId: 'integer|exists:Enterprise,id,active,true',
    billId: 'integer|exists:Bills,id',
  };
  let input = validateHelper.pick(req.params, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }
  let t = await models.sequelize.transaction();
  try {
    let result = await models.Bills.findOne({
      where: {
        enterpriseId: input.enterpriseId,
        id: input.billId,
      }
    });
    if (result === null) throw new MainError('common', 'notFound');
    await result.destroy({
      transaction: t
    });
    await t.commit();
    return res.return();
  } catch (err) {
    return next(err);
  }

};

Route.create = async function (req, res, next) {
  debug(`ENTER create method!`);

  const rules = {
    enterpriseId: 'integer|exists:Enterprise,id,active,true',
    amount: 'integer',
    description: 'min:1',
    currency: 'min:1',
    type: 'min:1|in:liberties,invitation',
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Bills.create(input, {
      transaction: t
    });
    await t.commit();

    req.params.billId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.update = async function (req, res, next) {
  debug(`ENTER update method!`);

  const rules = {
    enterpriseId: 'integer|exists:Enterprise,id,active,true',
    amount: 'integer',
    description: 'min:1',
    currency: 'min:1',
    type: 'min:1|in:liberties,invitation',
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();

  try {
    let result = await models.Bills.findById(req.body.billId);
    if (result === null) throw new MainError('common', 'notFound');
    await t.commit();

    req.params.billId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  debug('Enter index method!');

  const rules = {
    billId: 'integer|exists:Bills,id',
  };
  let input = validateHelper.pick(req.params, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }
  try {
    let result = await models.Bills.findById(input.billId);

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};
