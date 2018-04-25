'use strict';

// core
const debug = require('debug')('APP:USER_EDUCATION');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const moment = require('moment');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  const rules = {
    userId: 'integer',
  };

  let input = validateHelper.pick(req.query, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let filter = {
      where: {}
    };

    if (!_.isUndefined(input.userId)) filter.where.userId = input.userId;
    let result = await models.UserEducation.scope(['includeEducationLevel', 'includeSchools']).findAll(filter);
    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug('Enter show method!');

  const rules = {
    userId: 'integer',
  };

  let input = validateHelper.pick(req.query, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let filter = {
      where: {
        id: req.params.educationId,
      }
    };

    if (!_.isUndefined(input.userId)) filter.where.userId = input.userId;

    let result = await models.UserEducation.scope(['includeEducationLevel', 'includeSchools']).findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug('Enter create method!');

  let currentTime = new Date();
  const rules = {
    userId: 'required|integer|exists:User,id',
    educationLevelId: 'required|integer|exists:EducationLevel,id',
    schoolId: 'integer|exists:School,id',
    subject: 'min:2',
    graduationYear: `integer|range:${(currentTime.getFullYear() - 100)},${currentTime.getFullYear() + 6}`,
    remark: 'min:1',
    gpa: 'range:-1,6',
  };
  let input = _.pick(req.body, models.UserEducation.getEditableKeys());
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.UserEducation.create(input, {transaction: t});
    await t.commit();
    req.params.educationId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.update = async function(req, res, next) {
  debug('Enter update method!');

  let currentTime = new Date();

  const rules = {
    userId: 'integer|exists:User,id',
    educationLevelId: 'integer|exists:EducationLevel,id',
    schoolId: 'integer|exists:School,id',
    subject: 'min:2',
    graduationYear: `integer|range:${(currentTime.getFullYear() - 100)},${currentTime.getFullYear() + 6}`,
    remark: 'string',
    gpa: 'range:-1,6',
  };
  let input = _.pick(req.body, models.UserEducation.getEditableKeys());

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.UserEducation.findOne({
      where: {
        id: req.params.educationId,
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

Route.destroy = async function(req, res, next) {
  debug('Enter destroy method!');

  const rules = {
    userId: 'integer',
  };

  let input = validateHelper.pick(req.query, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {

    let filter = {
      where: {
        id: req.params.educationId,
      },
      transaction: t,
    };
    if (!_.isUndefined(input.userId)) filter.where.userId = input.userId;

    let result = await models.UserEducation.findOne(filter);
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











