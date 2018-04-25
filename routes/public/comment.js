'use strict';

// core
const debug = require('debug')('APP:PUBLIC_COMMENT');

const commentRoute = require(__base + 'routes/comment');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);
  return commentRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);

  return commentRoute.show(req, res, next);
};
