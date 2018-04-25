'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_COMPANY');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const companyRoute = require(__base + 'routes/company');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.checkCompanyExistMiddleware = function (req, res, next) {
  debug('Enter checkCompanyExistMiddleware method!');
  let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
  if (index === -1) next(new MainError('common', 'notFound'));

  req.params.companyId = res.locals.companyIds[index];
  next();
};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  req.query.enterpriseId = res.locals.enterpriseAuth.id;
  return companyRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug('Enter show method!');

  try {
    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Company.getReadAttributesByRole('enterprise'));

    req.query.enterpriseId = res.locals.enterpriseAuth.id;

    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug('Enter create method!');

  // Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Company.getReadAttributesByRole('enterprise'));

  // Edit Attribute ACL
  req.body = validateHelper.editAttributeFilter(req.body, models.Company.getEditAttributesByRole('enterprise'));

  req.body.enterpriseId = res.locals.enterpriseAuth.id;

  return companyRoute.create(req, res, next);
};

Route.update = async function(req, res, next) {
  debug('Enter update method!');

  try {
    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Company.getReadAttributesByRole('enterprise'));
    // Edit Attribute ACL
    req.body = validateHelper.editAttributeFilter(req.body, models.Company.getEditAttributesByRole('enterprise'));

    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }

    req.body.enterpriseId = res.locals.enterpriseAuth.id;

    return companyRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  debug('Enter destroy method!');

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
      req.params.enterpriseId = res.locals.enterpriseAuth.id;
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.candidateChart = async function(req, res, next) {
  debug('Enter candidateChart method!');

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyRoute.candidateChart(req, res, next);
  } catch (err) {
    return next(err);
  }
};
