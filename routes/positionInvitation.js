'use strict';

// core
const debug = require('debug')('APP:POSITION_INVITATION');


// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const moment = require('moment');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('ENTER index method!');
  const rules = {
    search: 'min:1',
    userId: 'integer|exists:User,id',
    companyId: 'integer|exists:Company,id',
    positionId: 'integer|exists:position,id,active,true',
    positionInvitationId: 'integer|exists:PositionInvitation,id',
    status: 'in:pending,accepted,rejected',
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let scopes = ['includeCompany'];
  let orderScopes = [];
  // filter condition
  let filter = await res.paginatorHelper.initFilter(req.query);
  if (!_.isUndefined(input.userId)) filter.where.userId = input.userId;
  if (!_.isUndefined(input.companyId)) filter.where.companyId = input.companyId;
  if (!_.isUndefined(input.positionInvitationId)) filter.where.positionInvitationId = input.positionInvitationId;
  if (!_.isUndefined(input.positionId)) filter.where.positionId = input.positionId;
  if (!_.isUndefined(input.status)) filter.where.status = input.status;
  if (!_.isUndefined(input.search)) {
    scopes.push({method: ['pendingWithSearch', input.search]});
    orderScopes.push({method: ['pendingWithSearch', input.search]});
  } else {
    scopes.push('pending');
  }

  filter.order = [['updatedAt', 'DESC']];

  try {
    let result = await models.PositionInvitation.scope(scopes).findAndCountAll(filter);
    result.count = await models.PositionInvitation.scope(orderScopes).findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};


Route.byInvitationPosition = async function(req, res, next) {
  debug('ENTER byInvitationPosition method!');
  const rules = {
    userId: 'integer|exists:User,id',
    companyId: 'integer|exists:Company,id',
    positionId: 'integer|exists:position,id,active,true',
    positionInvitationId: 'integer|exists:PositionInvitation,id',
    status: 'in:pending,accepted,rejected',
    active:'boolean',
    minExpiredDate: 'date',
    maxExpiredDate: 'date',
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  // filter condition
  let filter = await res.paginatorHelper.initFilter(req.query);
  filter.include = [];

  if (!_.isUndefined(input.userId)) filter.where.userId = input.userId;
  if (!_.isUndefined(input.companyId)) filter.where.companyId = input.companyId;
  if (!_.isUndefined(input.positionInvitationId)) filter.where.positionInvitationId = input.positionInvitationId;
  if (!_.isUndefined(input.positionId)) filter.where.positionId = input.positionId;
  if (!_.isUndefined(input.status)) filter.where.status = input.status;

  try {
    let result = await models.PositionInvitation.findAll(filter);
    if (result === null) throw new MainError('common', 'notFound');

    let scopes = ['includePositionSkills', 'includePositionTags', 'includeCompany', 'includeLocation', 'includeCategories', 'includeEducation', 'includeCandidates'];
    let orderFilter = {
      order :[['updatedAt', 'DESC']],
      where: {
        id: {
          $in: {$in: _.map(result, 'positionId')},
        },
        expiredDate: {
          $gte: input.minExpiredDate
        },
        active: input.active
      }
  };
    let positions = await models.Position.scope(scopes).findAndCountAll(orderFilter);
    positions.count = result.length;

    return res.paginatorWithCount(positions, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug('ENTER show method!');
  try {
    let filter = {
      where: {
        id: req.params.positionInvitationUserId,
        active:true,
        name: {$iLike: `%${filter}%`},
        expiredDate : {$gte: expiredDate}
      }
    };
    let result = await models.PositionInvitation.scope(['includeCompany', 'pending']).findOne(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function(req, res, next) {
  debug('ENTER update method!');

  const rules = {
    status: 'required|in:pending,accepted,rejected',
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.PositionInvitation.findOne({where: {id: req.params.positionInvitationId}});
    if (result === null) throw new MainError('common', 'notFound');

    switch (input.status) {
      case 'pending':
        input.acceptedAt = null;
        input.rejectedAt = null;
        break;
      case 'accepted':
        input.acceptedAt = moment().format();
        input.rejectedAt = null;
        break;
      case 'rejected':
        input.acceptedAt = null;
        input.rejectedAt = moment().format();
        break;
    }
    await result.updateAttributes(input, {transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};
