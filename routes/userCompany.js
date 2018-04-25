'use strict';

// core
const debug = require('debug')('APP:USER_COMPANY');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const jobs = require(__base + 'jobs');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  const rules = {
    search: 'min:1',
    status: 'in:fail,pass,pending',
    companyId: 'required|integer|exists:Company,id,isApproved,true',
  };

  try {
    req.query = validateHelper.attributeParseType(req.query, rules);
    let input = _.pick(req.query, Object.keys(rules));

    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    debug(err);
    return res.validateError2(err);
  }

  // filter condition
  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(req.query.companyId)) filter.where.companyId = req.query.companyId;
  if (!_.isUndefined(req.query.status)) filter.where.status = req.query.status;

  try {
    let result = await models.UserCompany.scope(['includeUser']).findAndCountAll(filter);
    result.count = await models.UserCompany.count({where:filter.where});

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug('Enter show method!');

  try {

    let result = await models.UserCompany.scope(['includeUser']).findOne({
      where: {
        id: req.params.userCompanyId
      }
    });
    if (result === null) throw new MainError('common', 'notFound');
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function(req, res, next) {
  debug('Enter update method!');

  let rules = {
    status: 'required|in:fail,pass,pending',
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.UserCompany.findOne({
      where: {
        id: req.params.userCompanyId,
      },
      transaction: t
    });
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(input, {transaction: t});
    await t.commit();
    // send an email to user.
    if(input.status === 'pass'){
      await jobs.create('email::userCompanyApproved', {
        result: result
      });
    }

    req.params.userCompanyId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.apply = async function(req, res, next) {
  debug('Enter create method!');

  let rules = {
    userId: 'required|integer|exists:User,id',
    companyName: 'required|string|exists:Company,name,isApproved,true',
    status:'in:fail,pass,pending'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let company = await models.Company.findOne({
      where: {
        name: input.companyName,
        isApproved: true,
      },
      transaction: t
    });

    if (company === null) throw new MainError('common', 'notFound');

    let result = await models.UserCompany.findOne({
      where: {
        userId: input.userId,
      },
      transaction: t
    });

    input.companyId = company.id;

    if (result !== null){
      if(company.id === result.companyId) throw new MainError('userCompany','appliedAlready');

      input.status = 'pending';
      await result.updateAttributes(input, {transaction: t});
    } else {
      result = await models.UserCompany.create(input, {transaction: t});
    }

    await t.commit();
    // send an email to company.
    await jobs.create('email::userCompanyApply', {
      company: company,
    });

    req.params.userCompanyId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    debug(`ERROR: %j`, err);
    await t.rollback();
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  let filter = {
    where: {
      id: req.params.userCompanyId
    }
  };
  try {
    let result = await models.UserCompany.destroy(filter);
    if (result === null) throw new MainError('common', 'notFound');
    return res.return();
  } catch (err) {
    return next(err);
  }
};
