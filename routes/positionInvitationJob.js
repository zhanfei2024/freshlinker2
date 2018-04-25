'use strict';

// core
const debug = require('debug')('APP:POSITION_INVITATION_JOB');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const candidateMethod = require(__base + 'methods/candidateMethod');
let Route = module.exports = {};

/**
 *  @api {get} /user/companies/self/positionInvitations Get all the invitations information
 *  @apiName  GetInvitations
 *  @apiGroup Invitation
 *
 *  @apiParam {Number} positionId  The position unique ID.
 *  @apiParam {Boolean} active  The active default true.
 *
 */
Route.index = async function(req, res, next) {
  debug('ENTER index method!');
  const rules = {
    search: 'min:1',
    positionId: 'min:1|exists:Position,id,active,true',
    active: 'min:0',
    companyId: 'min:1|exists:Company,id',
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let scopes = ['includePositionInvitations', 'includeCompany'];
  let orderScopes = [];
  // filter condition
  let filter = await res.paginatorHelper.initFilter(req.query);

  filter.where.active = !_.isUndefined(input.active) ? input.active : true;
  if (!_.isUndefined(input.positionId)) filter.where.positionId = input.positionId;
  if (!_.isUndefined(input.companyId)) filter.where.companyId = input.companyId;
  if (!_.isUndefined(input.search)) {
    scopes.push({method: ['includePositionWithSearch', input.search]});
    orderScopes.push({method: ['includePositionWithSearch', input.search]});
  } else {
    scopes.push('includePosition');
  }

  filter.order = [['updatedAt', 'DESC']];
  try {
    let result = await models.PositionInvitationJob.scope(scopes).findAndCountAll(filter);
    result.count = await models.PositionInvitationJob.scope(orderScopes).count({where:filter.where});

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }

};

/**
 *  @api {get} /user/companies/self/positionInvitations/:positionInvitationJobId Get all the invitation information
 *  @apiName  GetInvitation
 *  @apiGroup Invitation
 *
 *  @apiParam {Number} positionInvitationJobId  The PositionInvitationJob unique ID.
 */
Route.show = async function(req, res, next) {
  debug('ENTER show method!');
  try {
    let filter = {
      where: {
        id: req.params.positionInvitationJobId
      }
    };
    let result = await models.PositionInvitationJob.scope(['includePosition', 'includeCompany', 'includePositionInvitations']).findOne(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /user/companies/self/positionInvitations Create the Invitation information
 *  @apiName  CreateInvitation
 *  @apiGroup Invitation
 *
 */
Route.create = async function(req, res, next) {
  debug('ENTER cteate method!');

  const rules = {
    positionId: 'required|min:1|exists:Position,id,active,true',
    companyId: 'required|min:1|exists:Company,id',
    filter: 'array',
    'filter.*.type': 'required|min:1|in:education,location,skill,experience,languages,salary',
    maxCost: 'min:1',
  };
  if (!_.isUndefined(req.body.filter) && _.isArray(req.body.filter)) {
    _.each(req.body.filter, function (val, i) {
      switch (val.type) {
        case 'education':
          rules[`filter.${i}.educationLevelId`] = 'min:1|exists:EducationLevel,id';
          rules[`filter.${i}.gpa`] = 'min:1|range:-1,6';
          rules[`filter.${i}.graduationYear`] = 'min:1';
          //rules[`filter.${i}.subject`] = 'required|min:1';
          break;
        case 'location':
          rules[`filter.${i}.value`] = 'required|min:1|exists:Location,id';
          break;
        case 'skill':
          rules[`filter.${i}.value`] = 'required|min:1';
          break;
        case 'experience':
          rules[`filter.${i}.value`] = 'required|array';
          break;
        case 'languages':
          rules[`filter.${i}.value`] = 'array';
          break;
        case 'salary':
          rules[`filter.${i}.minSalary`] = 'required|min:0';
          rules[`filter.${i}.maxSalary`] = 'required|min:1';
          rules[`filter.${i}.salaryType`] = 'required|min:1|in:hourly,monthly,yearly';
          break;
      }
    });
  }
  let input = _.pick(req.body, Object.keys(rules));
  try {
    _.each(input.filter, function (val) {
      if (val.type === "skill") {
        let length = val.value.split(",");
        if (length > 3) throw new MainError('invitation', 'maxLimit');
      }
    });
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }
  let t = await models.sequelize.transaction();
  try {
    let invitationResult = await models.PositionInvitationJob.findOne({
      where: {
        positionId: input.positionId,
        companyId: input.companyId,
        active: true
      }
    });
    if (invitationResult !== null) throw new MainError('invitation', 'existPosition');
    // 计算人均费用
    input.cost = await candidateMethod.cost(input.positionId, input.filter);
    if (input.cost > input.maxCost) throw new MainError('invitation', 'maxCostInsufficient');
    let result = await models.PositionInvitationJob.create(input, {transaction: t});
    await t.commit();
    req.params.positionInvitationJobId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

/**
 *  @api {post} /user/companies/self/positionInvitations/:positionInvitationJobId Update the skill information
 *  @apiName  UpdateInvitation
 *  @apiGroup Invitation
 *
 *  @apiParam {Number} positionInvitationJobId  The PositionInvitationJob unique ID.
 *
 */
Route.update = async function(req, res, next) {
  debug('ENTER update method!');
  const rules = {
    positionId: 'required|min:1|exists:Position,id,active,true',
    companyId: 'required|min:1|exists:Company,id',
    filter: 'array',
    'filter.*.type': 'min:1|in:education,location,skill,experience,languages,salary',
    maxCost: 'min:1',
  };
  if (!_.isUndefined(req.body.filter) && _.isArray(req.body.filter)) {
    _.each(req.body.filter, function (val, i) {
      switch (val.type) {
        case 'education':
          rules[`filter.${i}.educationLevelId`] = 'min:1|exists:EducationLevel,id';
          rules[`filter.${i}.gpa`] = 'min:1|range:-1,6';
          rules[`filter.${i}.graduationYear`] = 'min:1';
          //rules[`filter.${i}.subject`] = 'required|min:1';
          break;
        case 'location':
          rules[`filter.${i}.value`] = 'required|min:1|exists:Location,id';
          break;
        case 'skill':
          rules[`filter.${i}.value`] = 'required|min:1';
          break;
        case 'experience':
          rules[`filter.${i}.value`] = 'required|array';
          break;
        case 'languages':
          rules[`filter.${i}.value`] = 'array';
          break;
        case 'salary':
          rules[`filter.${i}.minSalary`] = 'required|min:0';
          rules[`filter.${i}.maxSalary`] = 'required|min:1';
          rules[`filter.${i}.salaryType`] = 'required|min:1|in:hourly,monthly,yearly';
          break;
      }
    });
  }
  let input = _.pick(req.body, Object.keys(rules));
  try {
    _.each(input.filter, function (val) {
      if (val.type === "skill") {
        let length = val.value.split(",");
        if (length > 3) throw new MainError('invitation', 'maxLimit');
      }
    });
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }
  let t = await models.sequelize.transaction();
  try {
    //let isExists = await models.PositionInvitationJob.findOne({
    //  where: {
    //    positionId: input.positionId,
    //    companyId: input.companyId,
    //    active: true
    //  }
    //});
    //if (isExists !== null) throw new MainError('invitation', 'existPosition');
    let invitationResult = await models.PositionInvitationJob.findOne({
      where: {
        id: req.params.positionInvitationJobId,
      }
    });
    if (_.isNull(invitationResult)) throw new MainError('common', 'notFound');
    // 计算人均费用
    input.cost = await candidateMethod.cost(input.positionId, input.filter);
    if (input.cost > input.maxCost) throw new MainError('invitation', 'maxCostInsufficient');
    let result = await invitationResult.updateAttributes(input, {transaction: t});
    await t.commit();
    req.params.positionInvitationJobId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /user/companies/self/positionInvitations/:positionInvitationJobId Delete the Position Invitation information
 *  @apiName  DeleteInvitation
 *  @apiGroup Invitation
 *
 *  @apiParam {Number} positionInvitationJobId  The position invitation unique ID.
 */
Route.destroy = async function(req, res, next) {
  debug('ENTER delete method!');

  let t = await models.sequelize.transaction();
  try {
    let result = await models.PositionInvitationJob.findOne({
      where: {
        id: req.params.positionInvitationJobId
      },
      transaction: t
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

/**
 * return per capita cost.
 * @type {Function}
 */
Route.perCapitaCost = async function(req, res, next) {
  debug('Enter perCapitaCost method!');

  if (_.isUndefined(req.body.positionId) || _.isNull(req.body.positionId)) throw new MainError('invitation', 'choosePosition');
  if (_.isUndefined(req.body.filter) || _.isNull(req.body.filter)) throw new MainError('invitation', 'chooseFilter');
  try {
    let totalPrice = 0;
    let data = await candidateMethod.perCapitaCost(req.body.positionId, req.body.filter);
    _.forEach(data, function (val) {
      totalPrice += parseInt(val.price);
    });

    let maxPersonNum = 0;
    if (!_.isUndefined(req.body.maxCost) && !_.isNull(req.body.maxCost)) {
      if (totalPrice > req.body.maxCost) throw new MainError('invitation', 'costInsufficient');
      maxPersonNum = Math.round(_.divide(req.body.maxCost, totalPrice));
    }

    return res.return({
      positionId: req.body.positionId,
      maxCost: req.body.maxCost,
      companyId: req.body.companyId,
      filter: data,
      maxPersonNum: maxPersonNum,
      totalPrice: totalPrice
    });
  } catch (err) {
    return next(err);
  }
};

Route.filter = async function(req, res, next) {
  debug('Enter filter method!');
  const rules = {
    positionId: 'required|min:1|exists:Position,id,active,true',
    companyId: 'required|min:1|exists:Company,id',
    filter: 'array',
    'filter.*.type': 'required|min:1|in:education,location,skill,experience,languages,salary',
    maxCost: 'min:1',
  };
  if (!_.isUndefined(req.body.filter) && _.isArray(req.body.filter)) {
    _.each(req.body.filter, function (val, i) {
      switch (val.type) {
        case 'education':
          rules[`filter.${i}.educationLevelId`] = 'min:1|exists:EducationLevel,id';
          rules[`filter.${i}.gpa`] = 'min:1|range:-1,6';
          rules[`filter.${i}.graduationYear`] = 'min:1';
          //rules[`filter.${i}.subject`] = 'required|min:1';
          break;
        case 'location':
          rules[`filter.${i}.value`] = 'required|min:1|exists:Location,id';
          break;
        case 'skill':
          rules[`filter.${i}.value`] = 'required|min:1';
          break;
        case 'experience':
          rules[`filter.${i}.value`] = 'required|array';
          break;
        case 'languages':
          rules[`filter.${i}.value`] = 'array';
          break;
        case 'salary':
          rules[`filter.${i}.minSalary`] = 'required|min:0';
          rules[`filter.${i}.maxSalary`] = 'required|min:1';
          rules[`filter.${i}.salaryType`] = 'required|min:1|in:hourly,monthly,yearly';
          break;
      }
    });
  }
  let input = _.pick(req.body, Object.keys(rules));
  try {
    _.each(input.filter, function (val) {
      if (val.type === "skill") {
        let length = val.value.split(",");
        if (length > 3) throw new MainError('invitation', 'maxLimit');
      }
    });
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }
  return next();
};

/**
 * get invitation position person num.
 * @type {Function}
 */
Route.byInvitationPositionJobsPersonCount = async function(req, res, next) {
  debug('ENTER byInvitationPositionJobsPersonCount method!');
  const rules = {
    companyId: 'integer|exists:Company,id',
    positionId: 'integer|exists:position,id,active,true',
    positionInvitationJobId: 'integer|exists:PositionInvitationJob,id',
    status: 'in:pending,accepted,rejected',
  };
  let input = validateHelper.pick(req.params, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  // filter condition
  let filter = await res.paginatorHelper.initFilter(req.query);
  if (!_.isUndefined(input.companyId)) filter.where.companyId = input.companyId;
  if (!_.isUndefined(input.positionInvitationJobId)) filter.where.positionInvitationJobId = input.positionInvitationJobId;
  if (!_.isUndefined(input.positionId)) filter.where.positionId = input.positionId;
  if (!_.isUndefined(input.status)) filter.where.status = input.status;
  filter.order = [['updatedAt', 'DESC']];

  try {
    let result = await models.PositionInvitation.findAndCount(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};
