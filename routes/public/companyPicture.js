'use strict';

// core
const debug = require('debug')('APP:USER_COMPANY_PICTURE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const path = require('path');

const companyPictureRoute = require(__base + 'routes/companyPicture');

let Route = module.exports = {};

Route.index = async function(req, res, next) {

  return companyPictureRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  return companyPictureRoute.show(req, res, next);
};
