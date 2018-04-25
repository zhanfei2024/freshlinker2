'use strict';

// core
const debug = require('debug')('APP:USER_PICTURE');

// model
const models = require(__base + 'models');

// library

const userPictureRoute = require(__base + 'routes/userPicture');

let Route = module.exports = {};


Route.index = async function(req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userPictureRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userPictureRoute.show(req, res, next);
};

Route.uploadPicture = async function(req, res, next) {
  debug(`ENTER uploadPicture method!`);
  req.params.userId = res.locals.userAuth.id;
  return userPictureRoute.uploadPicture(req, res, next);
};

Route.uploadIcon = async function(req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userPictureRoute.uploadIcon(req, res, next);
};

Route.destroy = async function(req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return userPictureRoute.destroy(req, res, next);
};
