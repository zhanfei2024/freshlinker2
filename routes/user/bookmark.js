'use strict';

// core
const debug = require('debug')('APP:BOOK_MARK');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

const bookMarkRoute = require(__base + 'routes/bookMark');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  debug(`ENTER index method!`);
  req.query.userId = res.locals.userAuth.id;
  req.query.positionId = req.params.positionId;
  return bookMarkRoute.index(req, res, next);
};

Route.show = async function (req, res, next) {
  debug(`ENTER show method!`);
  req.params.userId = res.locals.userAuth.id;
  return bookMarkRoute.show(req, res, next);
};

Route.create = async function (req, res, next) {
  debug(`ENTER create method!`);
  req.body.userId = res.locals.userAuth.id;
  req.body.positionId = req.params.positionId;
  return bookMarkRoute.create(req, res, next);
};

Route.destroy = async function (req, res, next) {
  debug(`ENTER destroy method!`);
  req.params.userId = res.locals.userAuth.id;
  return bookMarkRoute.destroy(req, res, next);
};
