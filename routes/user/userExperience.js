'use strict';

// core
const debug = require('debug')('APP:USER_USER_EXPERIENCE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const userExperienceRoute = require(__base + 'routes/userExperience');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userExperienceRoute.index(req, res, next);
};

Route.show = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userExperienceRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  req.params.userId = res.locals.userAuth.id;
  return userExperienceRoute.create(req, res, next);
};

Route.update = async function(req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userExperienceRoute.update(req, res, next);
};

Route.destroy = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userExperienceRoute.destroy(req, res, next);
};
