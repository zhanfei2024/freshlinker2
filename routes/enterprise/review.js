'use strict';

// core
const debug = require('debug')('APP:USER_COMPANY_CANDIDATE');

// library
const _ = require('lodash');

const reviewRoute = require(__base + 'routes/review');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  debug(`ENTER index method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.query.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return reviewRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  debug(`ENTER show method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.query.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return reviewRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function (req, res, next) {
  debug(`ENTER update method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.query.companyId = res.locals.companyIds[index];
      req.query.isRead = true;
    } else {
      throw new MainError('common', 'notFound');
    }
    return reviewRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }
};
