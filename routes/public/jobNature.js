'use strict';

// core
const debug = require('debug')('APP:USER_OMPANY');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const jobNatureRoute = require(__base + 'routes/jobNature');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  // Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Company.getReadAttributesByRole('public'));

  return jobNatureRoute.index(req, res, next);

};
Route.show = async function (req, res, next) {
  // Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Company.getReadAttributesByRole('public'));

  return jobNatureRoute.show(req, res, next);
};
