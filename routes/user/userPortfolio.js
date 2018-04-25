'use strict';

// core
const debug = require('debug')('APP:USER_USER_PORTFOLIO');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const userPortfolioRoute = require(__base + 'routes/userPortfolio');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userPortfolioRoute.index(req, res, next);
};

Route.show = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userPortfolioRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  req.params.userId = res.locals.userAuth.id;
  return userPortfolioRoute.create(req, res, next);
};

Route.update = async function(req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userPortfolioRoute.update(req, res, next);
};

Route.destroy = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userPortfolioRoute.destroy(req, res, next);
};
