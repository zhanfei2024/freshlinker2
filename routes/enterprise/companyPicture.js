'use strict';

// core
const debug = require('debug')('APP:USER_COMPANY_PICTURE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const path = require('path');

const companyPictureRoute = require(__base + 'routes/companyPicture');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyPictureRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyPictureRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.uploadCover = async function(req, res, next) {
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyPictureRoute.uploadCover(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.uploadIcon = async function(req, res, next) {
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyPictureRoute.uploadIcon(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.uploadPicture = async function(req, res, next) {
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyPictureRoute.uploadPicture(req, res, next);
  } catch (err) {
    debug(err);
    return next(err);
  }
};

Route.destroy = async function (req, res, next) {
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyPictureRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};
