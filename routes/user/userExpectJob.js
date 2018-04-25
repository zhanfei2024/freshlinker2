'use strict';

// core
const debug = require('debug')('APP:USER_USER_EXPECT_JOB');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const userExpectJobRoute = require(__base + 'routes/userExpectJob');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userExpectJobRoute.index(req, res, next);
};

Route.show = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userExpectJobRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  req.body.userId = res.locals.userAuth.id;
  return userExpectJobRoute.create(req, res, next);
};

Route.update = async function(req, res, next) {
  req.body.userId = res.locals.userAuth.id;
  return userExpectJobRoute.update(req, res, next);
};

Route.destroy = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userExpectJobRoute.destroy(req, res, next);
};
