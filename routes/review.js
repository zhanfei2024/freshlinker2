'use strict';

// core
const debug = require('debug')('APP:REVIEW');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.index = async function(req,res,next){
  debug('Enter index method!');

  const rules = {
    companyId:'integer',
    positionId:'min:0',
    userId:'integer',
    sorting: 'in:featured,newest,popular',
    isRead:'boolean'
  };
  let input = validateHelper.pick(req.query, rules);

  try{
    await indicative.validate(input,rules,res.validatorMessage);
  }catch (err){
    return res.validateError2(err);
  }
  try {
    let scopes = ['includeCompany', 'includePosition', 'includeUser'];
    let filter = await res.paginatorHelper.initFilter(req.query);

    if (!_.isUndefined(input.userId)) filter.where.userId = {$eq: input.userId};
    if (!_.isUndefined(input.companyId)) filter.where.companyId = {$eq: input.companyId};
    if (!_.isUndefined(input.positionId)) filter.where.positionId = {$eq: input.positionId};
    if (!_.isUndefined(input.isRead)) filter.where.isRead = {$eq: input.isRead};
    if (!_.isUndefined(input.sorting)) {
      scopes.push({method: ['sorting', input.sorting]});
    } else {
      filter.order = [['updatedAt', 'DESC']];
    }

    filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Review.getAttributes(), ['updatedAt']);
    let result = await models.Review.scope(scopes).findAndCountAll(filter);
    result.count = await models.Review.count({where:filter.where});

    let allPromise = result.rows.map((row)=>{
      return new Promise((resolve)=>{
        if(!row.isRead && !input.isRead) row.updateAttributes({isRead:true});
        resolve();
      });
    });

    await Promise.all(allPromise);
    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }

};

Route.show = async function(req,res,next){
  debug('Enter show method!');

  const rules = {
    companyId:'integer',
    positionId:'integer',
    userId:'integer',
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.reviewId,
    }
  };

  let scopes = ['includePosition', 'includeUser', 'includeCompany'];

  if (!_.isUndefined(input.userId)) filter.where.userId = {$eq: input.userId};
  if (!_.isUndefined(input.companyId)) filter.where.companyId = {$eq: input.companyId};
  if (!_.isUndefined(input.positionId)) filter.where.positionId = {$eq: input.positionId};

  try {
    let result = await models.Review.scope(scopes).findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }

};

Route.create = async function(req,res,next){
  debug('Enter create method!');

  const rules = {
    companyId: 'min:1|integer|exists:Company,id',
    userId: 'min:1|integer|exists:User,id',
    positionId: 'min:1|integer|exists:Position,id',
    isAnonymous: 'boolean',
    content: 'required|min:1',
  };
  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();

  try {
    let result = await models.Review.create(input, {transaction: t});
    let company = await models.Company.findById(input.companyId, {transaction: t});
    if(company.isVIP){
      let data = {title:`${company.name}`};
      if(!_.isUndefined(result.companyId)) data.companyId = result.companyId;
      if(!_.isUndefined(result.positionId)) data.positionId = result.positionId;
      if(!_.isUndefined(result.id)) data.reviewId = result.id;
      if(!_.isUndefined(result.content)) data.content = result.content;

      await models.CompanyDynamic.create(data,{transaction:t});
    }

    await t.commit();

    req.params.reviewId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

Route.update = async function(req,res,next){
  debug('Enter update method!');

  const rules = {
    companyId: 'min:1|integer|exists:Company,id',
    isRead: 'boolean',
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.reviewId,
      companyId: input.companyId
    }
  };

  let t = await models.sequelize.transaction();

  try {
    let review = await models.Review.findOne(filter);
    if (review === null) throw new MainError('common', 'notFound');

    await review.updateAttributes(input, {transaction: t});

    await t.commit();

    req.params.reviewId = review.id;
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
        id: req.params.reviewId
      },
      transaction: t
    };

    let result = await models.Review.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};
