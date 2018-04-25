'use strict';

// core
const debug = require('debug')('APP:PUBLIC_COMPANY_FILE');

// model
const models = require(__base + 'models');

const companyFileRoute = require(__base + 'routes/companyFile');

let Route = module.exports = {};

Route.index = async function(req,res,next){
  debug('Enter index method!');

  req.query.companyId = parseInt(req.params.companyId);
  return companyFileRoute.index(req,res,next);
};

Route.show = async function(req,res,next){
  debug('Enter show method!');

  req.query.companyId = parseInt(req.params.companyId);
  return companyFileRoute.show(req,res,next);
};
