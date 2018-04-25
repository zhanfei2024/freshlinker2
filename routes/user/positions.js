'use strict';

// core
const debug = require('debug')('APP:USER_POSITION');

// model
const models = require(__base + 'models');

const positionRoute = require(__base + 'routes/position');
const comparedRoute = require(__base + 'methods/compared');

let Route = module.exports = {};

Route.candidateChart = async function(req, res, next) {
  debug('Enter candidateChart method!');

  return positionRoute.candidateChart(req, res, next);
};

Route.candidate = async function(req, res, next) {
  debug('Enter candidate method!');

  try {
    let result = await comparedRoute.skillsCompared(req, res, next);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};
