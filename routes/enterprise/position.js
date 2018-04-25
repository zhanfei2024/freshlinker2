'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_POSITION');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const moment = require('moment');

const positionRoute = require(__base + 'routes/position');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const positionMethod = require(__base + 'methods/positionMethod');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`Enter index method`);
  try {
    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Position.getReadAttributesByRole('index'));
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.query.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return positionRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug(`Enter show method`);
  // Read Attribute ACL
  try {
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Position.getReadAttributesByRole('enterprise'));
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.query.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }

    return positionRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug(`Enter create method`);

  try {
    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Position.getReadAttributesByRole('enterprise'));
    // Edit Attribute ACL
    req.body = validateHelper.editAttributeFilter(req.body, models.Position.getEditAttributesByRole('enterprise'), ['categoryIds', 'skills', 'tags']);

    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    req.body.companyId = res.locals.companyIds[index];
    req.body.expiredDate = moment().add(90, 'd');

    if (!res.locals.enterpriseAuth.canAddPosition) throw new MainError('position', 'confirmBuyPlan');

    return positionRoute.create(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function(req, res, next) {
  debug(`Enter update method`);
  try {
    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Position.getReadAttributesByRole('enterprise'));
    // Edit Attribute ACL
    req.body = validateHelper.editAttributeFilter(req.body, models.Position.getEditAttributesByRole('enterprise'), ['categoryIds', 'skills', 'tags']);

    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    req.body.companyId = res.locals.companyIds[index];

    if(req.body.active){
      req.body.expiredDate = moment().add(90, 'd');
      req.body.postedDate = moment();
    }
    return positionRoute.updateByCompany(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.renew = async function(req, res, next) {
  debug(`Enter renew method`);
  try {
    let categoryIds = req.body.categoryIds;
    // Edit Attribute ACL
    req.body = validateHelper.editAttributeFilter(req.body, models.Position.getEditAttributesByRole('enterprise'));
    req.body.categoryIds = categoryIds;

    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    req.body.companyId = res.locals.companyIds[index];
    req.body.expiredDate = moment().add(90, 'd');

    if (!res.locals.enterpriseAuth.canAddPosition) throw new MainError('common', 'notFound');

    req.body.active = true;
    return positionRoute.updateByCompany(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  debug(`Enter destroy method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    req.params.companyId = res.locals.companyIds[index];

    return positionRoute.destroyByCompany(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.candidateChart = async function(req, res, next) {
  return positionRoute.candidateChart(req, res, next);
};
