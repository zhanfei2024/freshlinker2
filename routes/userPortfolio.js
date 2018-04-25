'use strict';

// core
const debug = require('debug')('APP:USEREXHIBITION');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const hbs = require('hbs');

let Route = module.exports = {};

/**
 *  @api {get} /users/userId/portfolio Get all the works exhibitions information
 *  @apiName  GetUserPortfolios
 *  @apiGroup UserPortfolio
 *
 *  @apiParam {Number} userId  The user unique ID.
 *
 *
 *  @apiSuccess {Number} uploadId   The upload unique Id.
 *  @apiSuccess {String} title   Exhibition title.
 *  @apiSuccess {String} url     URL.
 *  @apiSuccess {text} description  Exhibition description.
 *
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *            "id": 2,
 *             "userId": 1,
 *             "uploadId": 1,
 *             "title": "作品展示标题",
 *             "description": "作品描述很重要的.",
 *             "url": "可以为空的",
 *             "createdBy": null,
 *             "updatedBy": null,
 *             "createdAt": "2016-03-29T01:46:21.955Z",
 *             "updatedAt": "2016-03-29T01:46:21.955Z"
 *      }
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.index = async function(req, res, next) {
  try {
    let filter = {
      where: {
        userId: req.params.userId
      }
    };
    let result = await models.UserPortfolio.scope(['includePictures']).findAll(filter);
    return res.collection(result);
  } catch (err) {
    return next(err);
  }

};

/**
 *  @api {get} /users/userId/portfolio/id Get the work exhibition information
 *  @apiName  GetUserPortfolios
 *  @apiGroup UserPortfolio
 *
 *  @apiParam {Number} userId  The user unique ID.
 *  @apiParam {Number} id  The works exhibition unique ID.
 *
 *
 *  @apiSuccess {Number} uploadId   The upload unique Id.
 *  @apiSuccess {String} title   Exhibition title.
 *  @apiSuccess {String} url     URL.
 *  @apiSuccess {text} description  Exhibition description.
 *
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function (req, res, next) {
  try {
    let filter = {
      where: {
        id: req.params.portfolioId,
        userId: req.params.userId
      }
    };
    let result = await models.UserPortfolio.scope(['includePictures']).findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /users/userId/portfolio Create the work exhibition information
 *  @apiName  CreateUserPortfolio
 *  @apiGroup UserPortfolio
 *
 *  @apiParam {Number} userId  The user unique ID.
 *
 *  @apiSuccess {Number} uploadId   The upload unique Id.
 *  @apiSuccess {String} title   Exhibition title.
 *  @apiSuccess {String} url     URL.
 *  @apiSuccess {text} description  Exhibition description.
 *
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.create = async function(req, res, next) {
  let t = await models.sequelize.transaction();
  try {

    let input = _.pick(req.body, models.UserPortfolio.getEditableKeys());
    input.userId = req.params.userId;

    let user = await models.User.findById(input.userId, {transaction:t});
    if (user === null) throw new MainError('common', 'notFound');

    let result = await models.UserPortfolio.create(input, {transaction: t});

    await t.commit();
    req.params.portfolioId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

/**
 *  @api {put} /users/userId/portfolio/id Update the work exhibition information
 *  @apiName  UpdateUserPortfolio
 *  @apiGroup UserPortfolio
 *
 *  @apiParam {Number} userId  The user unique ID.
 *  @apiParam {Number} id  The works exhibition unique ID.
 *
 *  @apiSuccess {Number} uploadId   The upload unique Id.
 *  @apiSuccess {String} title   Exhibition title.
 *  @apiSuccess {String} url     URL.
 *  @apiSuccess {text} description  Exhibition description.
 *
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.update = async function(req, res, next) {
  let t = await models.sequelize.transaction();
  try {
    let input = _.pick(req.body, models.UserPortfolio.getEditableKeys());
    let result = await models.UserPortfolio.findOne({
      where: {
        id: req.params.portfolioId,
        userId: req.params.userId,
      },
      transaction: t,
    });
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(input, {transaction: t});
    await t.commit();
    req.params.portfolioId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /users/userId/portfolio/id Delete the work exhibition information
 *  @apiName  DeleteUserPortfolio
 *  @apiGroup UserPortfolio
 *
 *  @apiParam {Number} userId  The user unique ID.
 *  @apiParam {Number} id  The works exhibition unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.destroy = async function (req, res, next) {
  let t = await models.sequelize.transaction();
  try {
    let result = await models.UserPortfolio.findOne({
      where: {
        id: req.params.portfolioId,
        userId: req.params.userId,
      },
      transaction: t,
    });
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({
      transaction: t
    });
    await t.commit();
    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

