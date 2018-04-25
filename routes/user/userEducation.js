'use strict';

// core
const debug = require('debug')('APP:USER_USER_EDUCATION');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const userEducationRoute = require(__base + 'routes/userEducation');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  req.query.userId = res.locals.userAuth.id;
  return userEducationRoute.index(req, res, next);
};

Route.show = async function (req, res, next) {
  req.query.userId = res.locals.userAuth.id;
  return userEducationRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  req.body.userId = res.locals.userAuth.id;
  return userEducationRoute.create(req, res, next);
};

Route.update = async function(req, res, next) {
  req.body.userId = res.locals.userAuth.id;
  return userEducationRoute.update(req, res, next);
};

Route.destroy = async function (req, res, next) {
  req.body.userId = res.locals.userAuth.id;
  return userEducationRoute.destroy(req, res, next);
};
