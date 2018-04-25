'use strict';

// core
const debug = require('debug')('APP:PUBLIC_COMPANY_DYNAMIC_PICTURE');

// model
const models = require(__base + 'models');

const companyDynamicPictureRoute = require(__base + 'routes/companyDynamicPicture');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  return companyDynamicPictureRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug('Enter show method!');

  return companyDynamicPictureRoute.show(req, res, next);
};
