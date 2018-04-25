'use strict';

// core
const debug = require('debug')('APP:PUBLIC_REVIEW');

// library
const _ = require('lodash');

const reviewRoute = require(__base + 'routes/review');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);

  req.query.positionId = null;
  if (!_.isUndefined(req.query.companyId)) req.query.companyId = parseInt(req.query.companyId);
  if (!_.isUndefined(req.query.userId)) req.query.userId = parseInt(req.query.userId);

  return reviewRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);

  return reviewRoute.show(req, res, next);
};
