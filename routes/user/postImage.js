'use strict';

// core
const debug = require('debug')('APP:USER_POST_IMAGE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

const postImageRoute = require(__base + 'routes/postImage');

let Route = module.exports = {};

Route.index = async function (req, res, next) {
  debug(`ENTER index method!`);
  try {
    let result = await models.PostImage.findOne({
      where: {
        id: req.params.imageId,
      },
      include: [{
        model: models.Post,
        as: 'post',
        required: true,
        where: {
          id: req.params.postId,
          userId: req.params.userId
        }
      }]
    });
    if (result === -1) throw new MainError('common', 'notFound');

    return postImageRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  try {
    let result = await models.PostImage.findOne({
      where: {
        id: req.params.imageId,
      },
      include: [{
        model: models.Post,
        as: 'post',
        required: true,
        where: {
          id: req.params.postId,
          userId: req.params.userId
        }
      }]
    });
    if (result === -1) throw new MainError('common', 'notFound');

    return postImageRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function (req, res, next) {
  try {
    let result = await models.PostImage.findOne({
      where: {
        id: req.params.imageId,
      },
      include: [{
        model: models.Post,
        as: 'post',
        required: true,
        where: {
          id: req.params.postId,
          userId: req.params.userId
        }
      }]
    });
    if (result === -1) throw new MainError('common', 'notFound');

    return postImageRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.uploadCover = async function(req, res, next) {
  debug(`ENTER uploadCover method!`);
  try {
    let result = await models.PostImage.findOne({
      where: {
        id: req.params.imageId,
      },
      include: [{
        model: models.Post,
        as: 'post',
        required: true,
        where: {
          id: req.params.postId,
          userId: req.params.userId
        }
      }]
    });
    if (result === -1) throw new MainError('common', 'notFound');

    return postImageRoute.uploadCover(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.uploadImage = async function(req,res,next){
  debug('Enter upload image method!');

  return postImageRoute.uploadImage(req,res,next);
};
