'use strict';

// core
const debug = require('debug')('APP:USER_USER_USER_COMPANY');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const userCompanyRoute = require(__base + 'routes/userCompany');

let Route = module.exports = {};

Route.apply = async function(req, res, next) {
  debug(`ENTER apply method!`);
  req.body.userId = res.locals.userAuth.id;

  return userCompanyRoute.apply(req, res, next);
};
