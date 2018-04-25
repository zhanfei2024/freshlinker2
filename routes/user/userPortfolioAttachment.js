'use strict';

// core
const debug = require('debug')('APP:USER_PORTFOLIO_PICTURE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const path = require('path');
const s3 = require('knox').createClient(require(__base + 'config/filesystem'));
const randomstring = require("randomstring");
const fs = require('fs');
const gm = require('gm').subClass({imagemagick: true});
const moment = require('moment');
const indicative = require('indicative');

const userPortfolioPictureRoute = require(__base + 'routes/userPortfolioPicture');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  req.params.portfolioId = req.params.portfolioId;
  return userPortfolioPictureRoute.index(req, res, next);
};

Route.show = async function (req, res, next) {
  req.params.pictureId = req.params.pictureId;
  return userPortfolioPictureRoute.show(req, res, next);
};

Route.uploadPicture = async function(req, res, next) {
  debug(`ENTER uploadPicture method!`);
  req.params.portfolioId = req.params.portfolioId;
  return userPortfolioPictureRoute.uploadPicture(req, res, next);
};

Route.destroy = async function (req, res, next) {
  req.params.pictureId = req.params.pictureId;
  return userPortfolioPictureRoute.destroy(req, res, next);
};
