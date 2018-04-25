'use strict';

// core
const debug = require('debug')('APP:USER_POST');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const postRoute = require(__base + 'routes/post');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`Enter index method!`);
  req.query.userId = res.locals.userAuth.id;
  return postRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug(`Enter show method!`);
  req.query.userId = res.locals.userAuth.id;
  return postRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`Enter create method!`);
  try {
    req.body.userId = res.locals.userAuth.id;
    req.body.isApproved = false;
    return postRoute.create(req, res, next);
  } catch (err) {
    return next(err);
  }

};

Route.update = async function(req, res, next) {
  debug(`Enter update method!`);

  // Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Post.getReadAttributesByRole('user'));

  // Edit Attribute ACL
  req.body = validateHelper.editAttributeFilter(req.body, models.Post.getEditAttributesByRole('user'), ['tags', 'categoryIds']);
  req.body.isApproved = false;
  return postRoute.update(req, res, next);
};

Route.modifyActive = async function(req, res, next) {
  debug(`Enter modify active method!`);

  // Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Post.getReadAttributesByRole('user'));

  // Edit Attribute ACL
  req.body = validateHelper.editAttributeFilter(req.body, models.Post.getEditAttributesByRole('user'), ['tags', 'categoryIds']);
  return postRoute.update(req, res, next);
};

Route.destroy = async function(req, res, next) {
  debug(`Enter destroy method!`);

  try {
    let filter = {
      where: {
        id: req.params.postId,
        userId: res.locals.userAuth.id,
      }
    };
    let result = await models.Post.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return postRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }

};

