'use strict';

// core
const debug = require('debug')('APP:USER_EXPERIENCE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const hbs = require('hbs');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

/**
 *  @api {get} /users/userId/experiences Get all the experiences information
 *  @apiName  GetExperiences
 *  @apiGroup UserExperience
 *
 *  @apiParam {Number} userId  The user unique ID.
 *
 *  @apiSuccess {Number} userId  The user unique ID.
 *  @apiSuccess {String} companyName   The company name.
 *  @apiSuccess {String} title   Experience title.
 *  @apiSuccess {Date} startedDate  Started date.
 *  @apiSuccess {Date} endedDate  End date.
 *  @apiSuccess {String} description  Description.
 *
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *             "id": 1,
 *             "userId": 1,
 *             "companyName": "公司名称",
 *             "title": "标题标题标题",
 *             "startedDate": "2016-02-02T00:00:00.000Z",
 *             "endedDate": "2016-10-02T00:00:00.000Z",
 *             "description": "备注备注备注备注备注备注备注",
 *             "createdBy": null,
 *             "updatedBy": null,
 *             "createdAt": "2016-03-29T01:15:45.657Z",
 *             "updatedAt": "2016-03-29T01:15:45.657Z"
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
    filter.order = [['startedDate', 'DESC']];
    let result = await models.UserExperience.findAll(filter);
    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /users/userId/experiences/id Get the experience information
 *  @apiName  GetExperience
 *  @apiGroup UserExperience
 *
 *  @apiParam {Number} userId  The user unique ID.
 *  @apiParam {Number} id  The experience unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function(req, res, next) {
  try {
    let filter = {
      where: {
        id: req.params.experienceId,
        userId: req.params.userId
      }
    };
    let result = await models.UserExperience.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /users/userId/experiences Create the experience information
 *  @apiName  CreateExperience
 *  @apiGroup UserExperience
 *
 *  @apiParam {Number} userId  The user unique ID.
 *
 *  @apiSuccess {Number} userId  The user unique ID.
 *  @apiSuccess {String} companyName   The company name.
 *  @apiSuccess {String} title   Experience title.
 *  @apiSuccess {Date} startedDate  Started date.
 *  @apiSuccess {Date} endedDate  End date.
 *  @apiSuccess {String} description  Description.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.create = async function(req, res, next) {
  debug('Enter create method!');

  const rules = {
    startedDate: 'min:1',
    endedDate: 'min:1',
  };
  let input = _.pick(req.body, models.UserExperience.getEditableKeys());
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    input.userId = req.params.userId;

    let user = await models.User.findById(input.userId, {transaction: t});
    if (user === null) throw new MainError('common', 'notFound');

    let result = await models.UserExperience.create(input, {transaction: t});
    await t.commit();
    req.params.experienceId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    debug(err);
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {put} /users/userId/experiences/id Update the experience information
 *  @apiName  UpdateExperience
 *  @apiGroup UserExperience
 *
 *  @apiParam {Number} userId  The user unique ID.
 *  @apiParam {Number} id  The Experience unique ID.
 *
 *  @apiSuccess {Number} userId  The user unique ID.
 *  @apiSuccess {String} companyName   The company name.
 *  @apiSuccess {String} title   Experience title.
 *  @apiSuccess {Date} startedDate  Started date.
 *  @apiSuccess {Date} endedDate  End date.
 *  @apiSuccess {String} description  Description.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.update = async function(req, res, next) {
  const rules = {
    startedDate: 'min:1',
    endedDate: 'min:1',
  };
  let input = _.pick(req.body, models.UserExperience.getEditableKeys());
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    debug(input, err);
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.UserExperience.findOne({
      where: {
        id: req.params.experienceId,
        userId: req.params.userId,
      },
      transaction: t,
    });
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(input, {transaction: t});
    await t.commit();
    req.params.experienceId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /users/userId/experiences/id Delete the experience information
 *  @apiName  DeleteExperience
 *  @apiGroup UserExperience
 *
 *  @apiParam {Number} userId  The user unique ID.
 *  @apiParam {Number} id  The Experience unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.destroy = async function(req, res, next) {
  let t = await models.sequelize.transaction();
  try {
    let result = await models.UserExperience.findOne({
      where: {
        id: req.params.experienceId,
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
