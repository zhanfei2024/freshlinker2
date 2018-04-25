'use strict';

// core
const debug = require('debug')('APP:USER_USER_SKILL');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const positionRoute = require(__base + 'routes/position');

let Route = module.exports = {};


Route.skillCompared = async function (req, res, next) {
  req.params.userId = res.locals.userAuth.id;
  return positionRoute.skillCompared(req, res, next);
};

