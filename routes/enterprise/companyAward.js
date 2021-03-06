'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_COMPANIES_AWARD');

// model
const models = require(__base + 'models');
const _ = require('lodash');

const companyAwardRoute = require(__base + 'routes/companyAward');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`Enter index method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.query.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyAwardRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug(`Enter show method`);

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.query.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }

    return companyAwardRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug(`Enter create method`);

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));

    let result = await models.Company.findById(req.params.companyId);
    if (!result.isVIP) throw new MainError('common', 'notFound');
    req.body.companyId = res.locals.companyIds[index];

    return companyAwardRoute.create(req, res, next);
  } catch (err) {
    return next(err);
  }
};


Route.destroy = async function(req, res, next) {
  debug(`Enter destroy method!`);

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    req.params.companyId = res.locals.companyIds[index];

    return companyAwardRoute.destroyByCompany(req, res, next);
  } catch (err) {
    return next(err);
  }
};
