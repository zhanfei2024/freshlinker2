'use strict';

// core
const debug = require('debug')('APP:USER_USER_LANGUAGE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const userLanguageRoute = require(__base + 'routes/userLanguage');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userLanguageRoute.index(req, res, next);
};

Route.show = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userLanguageRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  req.params.userId = res.locals.userAuth.id;
  return userLanguageRoute.create(req, res, next);
};

Route.update = async function(req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userLanguageRoute.update(req, res, next);
};

Route.destroy = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userLanguageRoute.destroy(req, res, next);
};
