'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_COMPANY_PICTURE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const companyDynamicPictureRoute = require(__base + 'routes/companyDynamicPicture');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  debug('Enter index method!');
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyDynamicPictureRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  debug('Enter show method!');
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyDynamicPictureRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.uploadPicture = async function(req, res, next) {
  debug('Enter upload picture method!');

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyDynamicPictureRoute.uploadPicture(req, res, next);
  } catch (err) {
    debug(err);
    return next(err);
  }
};

Route.destroy = async function (req, res, next) {
  debug('Enter destroy method!');

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyDynamicPictureRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};
