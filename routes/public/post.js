'use strict';

// core
const debug = require('debug')('APP:PUBLIC_POST');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const postRoute = require(__base + 'routes/post');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  debug(`Enter index method!`);
  req.query.active = true;
  req.query.isApproved = true;
  if (!_.isUndefined(req.query.companyId)) req.query.companyId = parseInt(req.query.companyId);

  return postRoute.index(req, res, next);
};

Route.show = async function (req, res, next) {
  debug(`Enter show method!`);

  req.query.active = true;
  req.query.isApproved = true;

  return postRoute.show(req, res, next);
};

Route.clickTraffic = async function (req, res, next) {
  debug(`Enter clickTraffic method!`);

  req.query.active = true;
  req.query.isApproved = true;

  return postRoute.clickTraffic(req, res, next);
};
