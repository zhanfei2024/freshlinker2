'use strict';

// core
const debug = require('debug')('APP:USER_REVIEW');

// model
const models = require(__base + 'models');

const reviewRoute = require(__base + 'routes/review');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);
  req.query.userId = res.locals.userAuth.id;
  req.query.positionId = null;
  return reviewRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);
  req.params.userId = res.locals.userAuth.id;
  return reviewRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  req.body.userId = res.locals.userAuth.id;
  return reviewRoute.create(req, res, next);
};

Route.destroy = async function(req, res, next) {
  debug(`ENTER destroy method!`);

  try {
    let filter = {
      where: {
        id: req.params.reviewId,
        userId: res.locals.userAuth.id,
      }
    };
    let result = await models.Review.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return reviewRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }

};

