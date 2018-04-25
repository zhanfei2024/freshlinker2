'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_POSITION_INVITATION_JOB');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const validateHelper = require(__base + 'helpers/ValidateHelper');

const positionInvitationJobRoute = require(__base + 'routes/positionInvitationJob');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.query.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return positionInvitationJobRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return positionInvitationJobRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.body.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return positionInvitationJobRoute.create(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function(req, res, next) {
  debug(`ENTER update method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.body.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return positionInvitationJobRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  debug(`ENTER delete method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return positionInvitationJobRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.perCapitaCost = function (req, res, next) {
  debug(`ENTER per capita cost method!`);
  try {
    return positionInvitationJobRoute.perCapitaCost(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.byInvitationPositionJobsPersonCount = function (req, res, next) {
  debug(`ENTER invitation position jobs person num method!`);
  try {
    return positionInvitationJobRoute.byInvitationPositionJobsPersonCount(req, res, next);
  } catch (err) {
    return next(err);
  }
};
