'use strict';

// core
const debug = require('debug')('APP:COMPANY_DYNAMIC');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const stringHelper = require(__base + 'helpers/StringHelper');

let Route = module.exports = {};

Route.index = async function(req,res,next){
  debug('Enter index method!');

  const rules = {
    search: 'min:1',
    companyId:'integer',
    positionId:'integer',
    reviewId:'integer',
    sorting: 'in:newest,popular',
  };
  let input = validateHelper.pick(req.query, rules);

  try{
    await indicative.validate(input,rules,res.validatorMessage);
  }catch (err){
    return res.validateError2(err);
  }

  let scopes = ['includeCompanyDynamicPictures','includePosition','includeReview','includePost'];
  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(input.search)) {
    filter.where.$or = {
      title: {
        $iLike: '%' + input.search + '%'
      },
      content: {
        $iLike: '%' + input.search + '%'
      },
    };
  }
  if (!_.isUndefined(input.reviewId)) filter.where.reviewId = {$eq: input.reviewId};
  if (!_.isUndefined(input.companyId)) filter.where.companyId = {$eq: input.companyId};
  if (!_.isUndefined(input.positionId)) filter.where.positionId = {$eq: input.positionId};
  if (!_.isUndefined(input.sorting)) {
    scopes.push({method: ['sorting', input.sorting]});
  } else {
    filter.order = [['updatedAt', 'DESC']];
  }

  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.CompanyDynamic.getAttributes(), ['updatedAt']);
  try {
    let result = await models.CompanyDynamic.scope(scopes).findAndCountAll(filter);
    result.count = await models.CompanyDynamic.count({where:filter.where});


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
    reviewId:'integer',
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.companyDynamicId,
    }
  };

  let scopes = ['includeCompanyDynamicPictures','includePosition','includeReview','includePost'];

  if (!_.isUndefined(input.reviewId)) filter.where.reviewId = {$eq: input.reviewId};
  if (!_.isUndefined(input.companyId)) filter.where.companyId = {$eq: input.companyId};
  if (!_.isUndefined(input.positionId)) filter.where.positionId = {$eq: input.positionId};

  try {
    let result = await models.CompanyDynamic.scope(scopes).findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }

};

Route.create = async function(req,res,next){
  debug('Enter create method!');

  const rules = {
    companyId: 'required|min:1|integer|exists:Company,id',
    reviewId: 'min:1|integer|exists:Review,id',
    positionId: 'min:1|integer|exists:Position,id',
    title: 'string',
    content: 'min:1',
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

    if (!_.isUndefined(input.title)) input.slug = stringHelper.slugify(input.title);

    let result = await models.CompanyDynamic.create(input, {transaction: t});

    await t.commit();

    req.params.companyDynamicId = result.id;
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
    reviewId: 'min:1|integer|exists:Review,id',
    positionId: 'min:1|integer|exists:Position,id',
    title: 'string',
    content: 'required|min:1',
  };
  let input = validateHelper.pick(req.body, rules);

  try {
    if (!_.isUndefined(input.title)) input.slug = stringHelper.slugify(input.title);

    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.companyDynamicId
    }
  };

  let t = await models.sequelize.transaction();

  try {
    let companyDynamic = await models.CompanyDynamic.findOne(filter);
    if (companyDynamic === null) throw new MainError('common', 'notFound');

    await companyDynamic.updateAttributes(input, {transaction: t});

    await t.commit();

    req.params.companyDynamicId = companyDynamic.id;
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
        id: req.params.companyDynamicId
      },
      transaction: t
    };

    let result = await models.CompanyDynamic.findOne(filter);
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
    let result = await models.CompanyDynamic.findOne({
      where: {
        id: req.params.companyDynamicId,
        companyId: req.params.companyId
      },
    });
    if (result === null) throw new MainError('common', 'notFound');
    return Route.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};
