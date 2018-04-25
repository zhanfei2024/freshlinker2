'use strict';

// core
const debug = require('debug')('APP:USER_POSITION_QUESTION');

// model
const models = require(__base + 'models');

const positionQuestionRoute = require(__base + 'routes/positionQuestion');

let Route = module.exports = {};

Route.show = async function(req, res, next) {
  debug(`ENTER show method`);
  req.params.positionId = parseInt(req.params.positionId);
  return positionQuestionRoute.show(req, res, next);
};
