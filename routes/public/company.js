'use strict';

// core
const debug = require('debug')('PUBLIC_COMPANY');

// model
const models = require(__base + 'models');

const companyRoute = require(__base + 'routes/company');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  debug('Enter index method!');
  // Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Company.getReadAttributesByRole('public'));

  // only show isApproved company
  req.query.isApproved = true;

  return companyRoute.index(req, res, next);

};
Route.show = async function (req, res, next) {
  debug('Enter show method!');
// Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Company.getReadAttributesByRole('public'));

  // only show isApproved company
  req.query.isApproved = true;

  return companyRoute.show(req, res, next);
};

Route.clickTraffic = async function (req, res, next) {
  debug('Enter clickTraffic method!');

  req.query.companyId = parseInt(req.params.companyId);

  return companyRoute.clickTraffic(req, res, next);
};
