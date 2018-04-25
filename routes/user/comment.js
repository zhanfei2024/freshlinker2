'use strict';

// core
const debug = require('debug')('APP:USER_COMMENT');

// model
const models = require(__base + 'models');


const commentRoute = require(__base + 'routes/comment');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.read = async function(req, res, next) {
  debug(`ENTER read method!`);
  req.query.toUserId = res.locals.userAuth.id;
  req.isRead = false;
  return commentRoute.read(req, res, next);
};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);
  req.query.userId = res.locals.userAuth.id;
  return commentRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);
  req.query.userId = res.locals.userAuth.id;
  return commentRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);
  try {
    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Comment.getReadAttributesByRole('user'));

    req.body.userId = res.locals.userAuth.id;
    return commentRoute.create(req, res, next);
  } catch (err) {
    return next(err);
  }

};

Route.update = async function(req, res, next) {
  debug(`ENTER update method!`);
  req.query.userId = res.locals.userAuth.id;
  return commentRoute.update(req, res, next);
};

Route.destroy = async function(req, res, next) {
  debug(`ENTER destroy method!`);

  try {
    let filter = {
      where: {
        id: req.params.commentId,
        userId: res.locals.userAuth.id,
      }
    };
    let result = await models.Comment.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return commentRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }

};

Route.like = async function (req, res, next) {
  debug(`ENTER like method!`);

  req.body.userId = res.locals.userAuth.id;
  req.body.commentId = req.params.commentId;
  return commentRoute.like(req, res, next);
};
