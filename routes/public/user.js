'use strict';

// core
const debug = require('debug')('APP:USER_USER');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const userRoute = require(__base + 'routes/user');

let Route = module.exports = {};

Route.show = async function (req, res, next) {
  debug(`ENTER show method!`);
  return userRoute.show(req, res, next);
};
