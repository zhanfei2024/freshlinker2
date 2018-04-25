'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_ENTERPRISE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const enterpriseRoute = require(__base + 'routes/enterprise');

let Route = module.exports = {};

Route.show = async function (req, res, next) {
  debug(`ENTER show method!`);

  req.params.enterpriseId = res.locals.enterpriseAuth.id;

  return enterpriseRoute.show(req, res, next);
};

Route.update = async function(req, res, next) {
  debug(`ENTER update method!`);
  req.params.enterpriseId = res.locals.enterpriseAuth.id;
  delete req.body.active;
  return enterpriseRoute.update(req, res, next);
};

Route.uploadPicture = async function(req, res, next) {
  debug(`ENTER upload picture method!`);
  req.params.enterpriseId = res.locals.enterpriseAuth.id;
  return enterpriseRoute.uploadPicture(req, res, next);
};

Route.role = async function(req, res, next) {
  debug(`ENTER role method!`);
  req.params.enterpriseId = res.locals.enterpriseAuth.id;
  return enterpriseRoute.role(req, res, next);
};

Route.buyPlan = async function(req, res, next) {
  debug(`ENTER select role method!`);
  req.params.enterpriseId = res.locals.enterpriseAuth.id;
  return enterpriseRoute.buyPlan(req, res, next);
};

Route.buyPositionQuota = async function(req, res, next) {
  debug(`ENTER buy positionQuota method!`);
  req.params.enterpriseId = res.locals.enterpriseAuth.id;
  return enterpriseRoute.buyPositionQuota(req, res, next);
};
