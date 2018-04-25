'use strict';

// core
const debug = require('debug')('APP:PUBLIC_COMPANY_AWARD');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const companyAwardRoute = require(__base + 'routes/companyAward');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);

  if (!_.isUndefined(req.params.companyId)) req.query.companyId = parseInt(req.params.companyId);

  return companyAwardRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);

  return companyAwardRoute.show(req, res, next);
};

