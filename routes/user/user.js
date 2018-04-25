'use strict';

// core
const debug = require('debug')('APP:USER_USER');

// model
const models = require(__base + 'models');

const userRoute = require(__base + 'routes/user');

let Route = module.exports = {};

Route.show = async function (req, res, next) {
  debug(`ENTER show method!`);
  if (!req.params.userId) {
    req.params.userId = res.locals.userAuth.id;
  }
  return userRoute.show(req, res, next);
};

Route.update = async function(req, res, next) {
  debug(`ENTER update method!`);
  req.params.userId = res.locals.userAuth.id;
  delete req.body.active;
  return userRoute.update(req, res, next);
};

Route.uploadPicture = async function(req, res, next) {
  debug(`ENTER upload picture method!`);
  req.params.userId = res.locals.userAuth.id;
  return userRoute.uploadPicture(req, res, next);
};

Route.role = async function(req, res, next) {
  debug(`ENTER role method!`)
  req.params.userId = res.locals.userAuth.id;
  return userRoute.role(req, res, next);
};

Route.uploadFile = async function(req, res, next) {
  debug(`ENTER uploadFile method!`);
  req.params.userId = res.locals.userAuth.id;
  return userRoute.uploadFile(req, res, next);
};
