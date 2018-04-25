'use strict';

// core
const debug = require('debug')('APP:SETTING');

// model
let models = require(__base + 'models');

// library
const moment = require('moment');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

/**
 * Setting Route
 * @module Route
 */
let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');
  try {
    let filter = await res.paginatorHelper.initFilter(req.query);
    filter.order = [['id', 'DESC']];

    let result = await models.Setting.findAndCountAll(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);

  try {
    let filter = {
      where: {
        id: req.params.settingId
      }
    };

    let result = await models.Setting.findOne(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function (req, res, next) {
  debug('Enter create method!');
  const rules = {
    global: 'required|min:1|json'
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Setting.create(input, {transaction: t});

    await t.commit();

    req.params.settingId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.update = async function (req, res, next) {
  debug('Enter update method!');
  const rules = {
    global: 'required|min:1|json'
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Setting.findOne();
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(input);
    await t.commit();

    req.params.settingId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  debug('Enter destroy method!');
  let t = await models.sequelize.transaction();
  try {
    let filter = {
      where: {
        id: req.params.settingId
      },
      transaction: t
    };

    let result = await models.Setting.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};
