'use strict';

// core
const debug = require('debug')('APP:USER_COMPANY_USER_COMPANY');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const userCompanyRoute = require(__base + 'routes/userCompany');

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
    return userCompanyRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  debug(`ENTER show method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) throw new MainError('common', 'notFound');

    let filter = {
      where: {
        id: req.params.userCompanyId,
        companyId: res.locals.companyIds[index]
      }
    };
    let result = await models.UserCompany.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return userCompanyRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function (req, res, next) {
  debug(`ENTER update method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) throw new MainError('common', 'notFound');

    let filter = {
      where: {
        id: req.params.userCompanyId,
        companyId: res.locals.companyIds[index]
      }
    };
    let result = await models.UserCompany.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return userCompanyRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) throw new MainError('common', 'notFound');

    let filter = {
      where: {
        id: req.params.userCompanyId,
        companyId: res.locals.companyIds[index]
      }
    };
    let result = await models.UserCompany.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return userCompanyRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};
