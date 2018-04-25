'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_POST');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const postRoute = require(__base + 'routes/post');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  debug(`Enter index method!`);

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) throw new MainError('common', 'notFound');

    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Post.getReadAttributesByRole('enterprise'));
    req.query.companyId = res.locals.companyIds[index];

    return postRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  debug(`Enter show method!`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) throw new MainError('common', 'notFound');

    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Post.getReadAttributesByRole('enterprise'));
    req.query.companyId = res.locals.companyIds[index];

    return postRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug(`Enter create method!`);

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1)  throw new MainError('common', 'notFound');

    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Post.getReadAttributesByRole('enterprise'));

    // Edit Attribute ACL
    req.body = validateHelper.editAttributeFilter(req.body, models.Post.getEditAttributesByRole('enterprise'), ['tags', 'categoryIds']);
    req.body.companyId = res.locals.companyIds[index];
    req.body.isApproved = false;
    return postRoute.create(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function(req, res, next) {
  debug(`Enter update method!`);

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) throw new MainError('common', 'notFound');

    let filter = {
      where: {
        id: req.params.postId,
        companyId: res.locals.companyIds[index]
      }
    };
    let result = await models.Post.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Post.getReadAttributesByRole('enterprise'));

    // Edit Attribute ACL
    req.body = validateHelper.editAttributeFilter(req.body, models.Post.getEditAttributesByRole('enterprise'), ['tags', 'categoryIds']);
    req.body.isApproved = false;

    return postRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }

};

Route.modifyActive = async function(req, res, next) {
  debug(`Enter modify active method!`);

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) throw new MainError('common', 'notFound');

    let filter = {
      where: {
        id: req.params.postId,
        companyId: res.locals.companyIds[index]
      }
    };
    let result = await models.Post.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    // Read Attribute ACL
    req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Post.getReadAttributesByRole('enterprise'));

    // Edit Attribute ACL
    req.body = validateHelper.editAttributeFilter(req.body, models.Post.getEditAttributesByRole('enterprise'), ['tags', 'categoryIds']);

    return postRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  debug(`Enter destroy method!`);

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) throw new MainError('common', 'notFound');

    let filter = {
      where: {
        id: req.params.postId,
        companyId: res.locals.companyIds[index]
      }
    };
    let result = await models.Post.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    return postRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};

