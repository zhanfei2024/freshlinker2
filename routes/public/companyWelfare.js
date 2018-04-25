'use strict';

// core
const debug = require('debug')('APP:PUBLIC_COMPANY_WELFARE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const companyWelfareRoute = require(__base + 'routes/companyWelfare');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);

  if (!_.isUndefined(req.params.companyId)) req.query.companyId = parseInt(req.params.companyId);

  return companyWelfareRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);

  return companyWelfareRoute.show(req, res, next);
};

