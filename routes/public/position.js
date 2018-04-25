'use strict';

// core
const debug = require('debug')('APP:PUBLIC_POSITION');

// model
const models = require(__base + 'models');

// library
const moment = require('moment');

const positionRoute = require(__base + 'routes/position');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  req.query.active = true;
  req.query.minExpiredDate = moment().format('YYYY-MM-DD'); // 获取当天日期.验证职位是否过期.
  return positionRoute.index(req, res, next);
};

Route.show = async function (req, res, next) {
  debug('Enter show method!');

  req.query.active = true;
  req.query.minExpiredDate = moment().format('YYYY-MM-DD'); // 获取当天日期.验证职位是否过期.
  return positionRoute.show(req, res, next);
};

Route.bySimilarPosition = async function(req, res, next) {
  debug('Enter bySimilarPosition method!');

  req.query.active = true;
  req.query.minExpiredDate = moment().format('YYYY-MM-DD'); // 获取当天日期.验证职位是否过期.
  return positionRoute.byPublicSimilarPosition(req, res, next);
};

Route.categoriesPosition = async function(req, res, next) {
  debug('Enter categoriesPosition method!');

  req.query.active = true;
  req.query.minExpiredDate = moment().format('YYYY-MM-DD'); // 获取当天日期.验证职位是否过期.
  return positionRoute.byPublicSimilarPosition(req, res, next);
};

Route.candidateChart = async function(req, res, next) {
  debug('Enter candidateChart method!');

  return positionRoute.candidateChart(req, res, next);
};

Route.clickTraffic = async function (req, res, next) {
  debug('Enter clickTraffic method!');

  req.query.active = true;
  req.query.minExpiredDate = moment().format('YYYY-MM-DD'); // 获取当天日期.验证职位是否过期.
  return positionRoute.clickTraffic(req, res, next);
};

Route.indexByCompanyName = async function (req, res, next) {
  debug('Enter indexByCompanyName method!');

  req.query.active = true;
  req.query.minExpiredDate = moment().format('YYYY-MM-DD'); // 获取当天日期.验证职位是否过期.
  return positionRoute.indexByCompanyName(req, res, next);
};

Route.indexByCompany = async function (req, res, next) {
  debug('Enter indexByCompany method!');

  req.query.companyId = parseInt(req.params.companyId);
  req.query.active = true;
  req.query.minExpiredDate = moment().format('YYYY-MM-DD'); // 获取当天日期.验证职位是否过期.
  return positionRoute.index(req, res, next);
};
