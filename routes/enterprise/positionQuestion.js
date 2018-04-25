'use strict';

// core
const debug = require('debug')('APP:USER_POSITION_QUESTION');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const moment = require('moment');

const positionQuestionRoute = require(__base + 'routes/positionQuestion');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.show = async function(req, res, next) {
  debug(`ENTER show method`);
  req.params.positionId = parseInt(req.params.positionId);
  return positionQuestionRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    req.body.positionId = parseInt(req.params.positionId);
    return positionQuestionRoute.create(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function(req, res, next) {
  debug(`ENTER update method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    req.body.positionId = parseInt(req.params.positionId);
    return positionQuestionRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function (req, res, next) {
  debug(`ENTER destroy method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    req.params.questionId = parseInt(req.params.questionId);
    return positionQuestionRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};
