'use strict';

// core
const debug = require('debug')('APP:USER_EXPECT_JOB');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const moment = require('moment');

let Route = module.exports = {};

/**
 *  @api {get} /users/userId/expect_jobs Get all the work experiences information
 *  @apiName  GetUserExpectJobs
 *  @apiGroup UserExpectJob
 *
 *  @apiParam {Number} userId  The user unique ID.
 *
 *  @apiSuccess {Number} userId  The user unique ID.
 *  @apiSuccess {String} company The company name.
 *  @apiSuccess {String} position The position name.
 *  @apiSuccess {Date} entryDate   Entry date.
 *  @apiSuccess {Date} separationDate  Separation date.
 *  @apiSuccess {String} content  Work experience content.
 *
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *            "id": 1,
 *             "userId": 1,
 *             "company": "yoov",
 *             "position": "职位",
 *             "entryDate": null,
 *             "separationDate": null,
 *             "content": "内容很重要;/",
 *             "createdBy": null,
 *             "updatedBy": null,
 *             "createdAt": "2016-03-29T01:30:30.712Z",
 *             "updatedAt": "2016-03-29T01:30:30.712Z"
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
    let result = await models.UserExpectJob.scope(['includeUser', 'includeExpectPosition', 'includeLocation', 'includeJobNature']).findAll(filter);
    return res.collection(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /users/userId/expect_jobs/id Get the work experience information
 *  @apiName  GetUserExpectJob
 *  @apiGroup UserExpectJob
 *
 *  @apiParam {Number} userId  The user unique ID.
 *  @apiParam {Number} id  The work_experience unique ID.
 *
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
        id: req.params.expectJobId,
        userId: req.params.userId
      }
    };
    let result = await models.UserExpectJob.scope(['includeUser', 'includeExpectPosition', 'includeLocation', 'includeJobNature']).findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /users/userId/expect_jobs Create the work experiences information
 *  @apiName  CreateUserExpectJob
 *  @apiGroup UserExpectJob
 *
 *  @apiParam {Number} userId  The user unique ID.
 *
 *  @apiSuccess {Number} userId  The user unique ID.
 *  @apiSuccess {String} company The company name.
 *  @apiSuccess {String} position The position name.
 *  @apiSuccess {Date} entryDate   Entry date.
 *  @apiSuccess {Date} separationDate  Separation date.
 *  @apiSuccess {String} content  Work experience content.
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
  const rules = {
    userId: 'required|integer|exists:User,id',
    locationId: 'min:1|integer|exists:Location,id',
    jobNatureId: 'min:1|integer|exists:JobNature,id',
    expectPositionId: 'min:1|integer|exists:PositionCategory,id',
    type: 'in:full-time,part-time,internship,freelance,others',
    salaryType: 'in:hourly,monthly,yearly',
    minSalary: 'min:1',
    maxSalary: 'min:1',
    content: 'min:1',
  };

  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    // 选择大类时,组装当前类的子类.
    let locationIds = [];
    if (!_.isUndefined(input.locationId)) {
      let location = await models.Location.findOne({
        where: {id: input.locationId}
      });
      let locationChildrens = await location.getChildren();
      _.each(locationChildrens, function (val) {
        locationIds.push(val.id);
      });
    }
    if (!_.isEmpty(locationIds)) throw new MainError('user', 'locationNotExists');

    // 选择大类时,组装当前类的子类.
    let categoriesIds = [];
    if (!_.isUndefined(input.expectPositionId)) {
      let category = await models.PositionCategory.findOne({
        where: {id: input.expectPositionId}
      });
      let categoryChildrens = await category.getChildren();
      _.each(categoryChildrens, function (val) {
        categoriesIds.push(val.id);
      });
    }
    if (!_.isEmpty(categoriesIds)) throw new MainError('user', 'categoryNotExists');

    let userJob = await models.UserExpectJob.findOne({
      where: {
        userId: input.userId
      }, transaction: t
    });
    if (!_.isNull(userJob)) throw new MainError('user', 'existUserExpecJob');

    let result = await models.UserExpectJob.create(input, {transaction: t});

    await t.commit();
    req.params.expectJobId = result.id;
    req.params.userId = input.userId;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {put} /users/userId/expect_jobs/id Update the work experience information
 *  @apiName  UpdateUserExpectJob
 *  @apiGroup UserExpectJob
 *
 *  @apiParam {Number} userId  The user unique ID.
 *  @apiParam {Number} id  The work_experience unique ID.
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
    userId: 'required|integer|exists:User,id',
    locationId: 'integer|exists:Location,id',
    jobNatureId: 'min:1|integer|exists:JobNature,id',
    expectPositionId: 'integer|exists:PositionCategory,id',
    type: 'in:full-time,part-time,internship,freelance,others',
    salaryType: 'in:hourly,monthly,yearly',
    minSalary: 'min:1|numeric',
    maxSalary: 'min:1|numeric',
    content: 'min:1',
  };

  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {

    // 选择大类时,组装当前类的子类.
    let locationIds = [];
    if (!_.isUndefined(input.locationId)) {
      let location = await models.Location.findOne({
        where: {id: input.locationId}
      });
      let locationChildrens = await location.getChildren();
      _.each(locationChildrens, function (val) {
        locationIds.push(val.id);
      })
    }
    if (!_.isEmpty(locationIds)) throw new MainError('user', 'locationNotExists');

    // 选择大类时,组装当前类的子类.
    let categoriesIds = [];
    if (!_.isUndefined(input.expectPositionId)) {
      let category = await models.PositionCategory.findOne({
        where: {id: input.expectPositionId}
      });
      let categoryChildrens = await category.getChildren();
      _.each(categoryChildrens, function (val) {
        categoriesIds.push(val.id);
      })
    }
    if (!_.isEmpty(categoriesIds)) throw new MainError('user', 'categoryNotExists');

    let validateResult = await models.UserExpectJob.findOne({
      where: {
        id: {
          $ne: req.params.expectJobId
        },
        userId: req.params.userId,
      },
      transaction: t,
    });
    if (!_.isNull(validateResult)) throw new MainError('user', 'existUserExpecJob');

    let result = await models.UserExpectJob.findOne({
      where: {
        id: req.params.expectJobId,
        userId: input.userId,
      },
      transaction: t,
    });
    if (result === null) throw new MainError('common', 'notFound');
    if (_.isUndefined(input.locationId)) input.locationId = null;
    await result.updateAttributes(input, {transaction: t});
    await t.commit();

    req.params.expectJobId = result.id;
    req.params.userId = input.userId;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /users/userId/expect_jobs/id Delete the work experience information
 *  @apiName  DeleteUserExpectJob
 *  @apiGroup UserExpectJob
 *
 *  @apiParam {Number} userId  The user unique ID.
 *  @apiParam {Number} id  The work_experience unique ID.
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
    let result = await models.UserExpectJob.findOne({
      where: {
        id: req.params.expectJobId,
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

