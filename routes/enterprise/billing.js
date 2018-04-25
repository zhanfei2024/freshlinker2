'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_BILLING');

// library
const bill = require(__base + 'routes/billing');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');
  req.query.enterpriseId = res.locals.enterpriseAuth.id;
  return bill.index(req, res, next);
};


Route.destroy = async function(req, res, next) {
  debug('Enter delete method!');
  req.params.enterpriseId = res.locals.enterpriseAuth.id;
  return bill.destroy(req, res, next);
};

Route.show = async function(req, res, next) {
  debug('Enter delete method!');

  return bill.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug('Enter delete method!');
  req.params.enterpriseId = res.locals.enterpriseAuth.id;
  return bill.create(req, res, next);
};

Route.update = async function(req, res, next) {
  debug('Enter delete method!');
  req.params.enterpriseId = res.locals.enterpriseAuth.id;
  return bill.update(req, res, next);
};
