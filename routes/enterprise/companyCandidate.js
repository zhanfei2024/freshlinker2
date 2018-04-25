'use strict';

// core
const debug = require('debug')('APP:USER_COMPANY_CANDIDATE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const candidateRoute = require(__base + 'routes/candidate');

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
    return candidateRoute.index(req, res, next);
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
    return candidateRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function (req, res, next) {
  debug(`ENTER update method!`);
  try {
    let result = null;
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
      result = await models.Candidate.findOne({
        where: {
          id: req.params.candidateId,
          companyId: req.params.companyId
        }
      });
    } else {
      throw new MainError('common', 'notFound');
    }
    if (result === null) throw new MainError('common', 'notFound');
    return candidateRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }
};
