'use strict';

// core
const debug = require('debug')('APP:COMPANY_AWARD');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const moment = require('moment');

let Route = module.exports = {};

Route.index = async function(req,res,next){
  debug('Enter index method!');

  const rules = {
    search: 'min:1',
    companyId:'integer',
  };
  let input = validateHelper.pick(req.query, rules);

  try{
    await indicative.validate(input,rules,res.validatorMessage);
  }catch (err){
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(input.search)) {
    filter.where.$or = {
      name: {
        $iLike: '%' + input.search + '%'
      },
    };
  }

  if (!_.isUndefined(input.companyId)) filter.where.companyId = {$eq: input.companyId};

  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.CompanyAward.getAttributes(), ['updatedAt']);
  try {
    let result = await models.CompanyAward.findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }

};

Route.show = async function(req,res,next){
  debug('Enter show method!');

  const rules = {
    companyId:'integer',
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.companyAwardId,
    }
  };

  if (!_.isUndefined(input.companyId)) filter.where.companyId = {$eq: input.companyId};

  try {
    let result = await models.CompanyAward.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }

};

Route.create = async function(req,res,next){
  debug('Enter create method!');

  const rules = {
    companyId: 'required|min:1|integer|exists:Company,id',
    name: 'required|string',
    date:'string',
    description: 'string',
  };
  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let company = await models.Company.findById(input.companyId);
    if (!company.isVIP) throw new MainError('company', 'isVIP');

    let result = await models.CompanyAward.create(input, {transaction: t});

    await t.commit();

    req.params.companyAwardId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

Route.update = async function(req,res,next){
  debug('Enter update method!');

  const rules = {
    companyId: 'required|min:1|integer|exists:Company,id',
    name: 'required|string',
    date:'string',
    description: 'string',
  };
  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.companyAwardId
    }
  };

  let t = await models.sequelize.transaction();

  try {
    let companyAward = await models.CompanyAward.findOne(filter);
    if (companyAward === null) throw new MainError('common', 'notFound');

    await companyAward.updateAttributes(input, {transaction: t});

    await t.commit();

    req.params.companyAwardId = companyAward.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

Route.destroy = async function(req, res, next) {
  let t = await models.sequelize.transaction();
  try {
    let filter = {
      where: {
        id: req.params.companyAwardId
      },
      transaction: t
    };

    let result = await models.CompanyAward.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.destroyByCompany = async function(req, res, next) {
  debug('ENTER destroyByCompany method!');

  try {
    let result = await models.CompanyAward.findOne({
      where: {
        id: req.params.companyAwardId,
        companyId: req.params.companyId
      },
    });
    if (result === null) throw new MainError('common', 'notFound');
    return Route.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};
