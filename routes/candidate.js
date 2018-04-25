'use strict';

// core
const debug = require('debug')('APP:CANDIDATE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const moment = require('moment');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const candidateMethod = require(__base + 'methods/candidateMethod');
const jobs = require(__base + 'jobs');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  const rules = {
    search: 'min:1',
    candidateStatusId: 'integer|exists:CandidateStatus,id',
    companyId: 'integer|exists:Company,id',
    userId: 'integer|exists:User,id',
    positionId: 'integer',
    isInvitation: 'boolean',
  };

  req.query = validateHelper.attributeParseType(req.query, rules);
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let scopes = ['includeCandidateStatus', 'includeUser', 'includeCompany','includeCandidateQuestions','includePosition'];
  let orderScopes = [];
  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(input.positionId)) filter.where.positionId = input.positionId;
  if (!_.isUndefined(input.companyId)) filter.where.companyId = input.companyId;
  if (!_.isUndefined(input.userId)) filter.where.userId = input.userId;
  if (!_.isUndefined(input.candidateStatusId)) filter.where.candidateStatusId = input.candidateStatusId;
  if (!_.isUndefined(input.isInvitation)) filter.where.isInvitation = input.isInvitation;
  if (!_.isUndefined(input.search)) {
    scopes.push({method: ['includePositionWithSearch', input.search]});
    orderScopes.push({method: ['includePositionWithSearch', input.search]});
  }

  // query condition
  filter.order = [['isInvitation', 'DESC'], ['appliedAt', 'DESC']];
  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Candidate.getAttributes(), ['appliedAt', 'candidateStatusId', 'userId', 'positionId', 'isInvitation']);

  try {
    let result = await models.Candidate.scope(scopes).findAndCountAll(filter);
    result.count = await models.Candidate.scope(orderScopes).count({where:filter.where});

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.indexByApplier = async function(req, res, next) {
  debug('Enter indexByApplier method!');

  const rules = {
    userId: 'exists:User,id',
    companyId: 'exists:Company,id',
    positionId: 'exists:Position,id,active,true'
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  // filter condition
  let filter = await res.paginatorHelper.initFilter(req.query);

  if (!_.isUndefined(req.query.userId)) filter.where.userId = req.query.userId;
  if (!_.isUndefined(req.query.positionId)) filter.where.positionId = req.query.positionId;
  if (!_.isUndefined(req.query.companyId)) filter.where.companyId = req.query.companyId;

  // query condition
  filter.order = [['isInvitation', 'DESC'], ['appliedAt', 'DESC']];

  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Candidate.getAttributes(), ['appliedAt', 'isInvitation']);
  let scopes = ['includePosition', 'includeCompany', 'includeCandidateStatus','includeCandidateQuestions'];
  try {
    let result = await models.Candidate.scope(scopes).findAndCountAll(filter);
    result.count = await models.Candidate.count({where:filter.where});

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug('Enter show method!');

  try {

    let result = await models.Candidate.scope(['includeCandidateQuestions']).findOne({
      where: {
        id: req.params.candidateId
      }
    });
    if (result === null) throw new MainError('common', 'notFound');
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.check = async function(req, res, next) {
  debug('Enter check method!');

  const rules = {
    companyId: 'integer|exists:Company,id',
    userId: 'integer|exists:User,id',
    positionId: 'integer|exists:Position,id,active,true'
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    attributes: ['id'],
    where: {}
  };

  if (!_.isUndefined(req.query.userId)) filter.where.userId = req.query.userId;
  if (!_.isUndefined(req.query.companyId)) filter.where.companyId = req.query.companyId;
  if (!_.isUndefined(req.query.positionId)) filter.where.positionId = req.query.positionId;

  try {
    let result = await models.Candidate.findOne(filter);
    return res.return({
      result: {
        check: result !== null
      }
    });
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug('Enter create method!');

  const rules = {
    userId: 'required|integer|exists:User,id',
    positionId: 'required|integer|exists:Position,id,active,true',
    question: 'array',
    isInvitation: 'required|boolean',
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let userFile = await models.UserFile.findOne({
      where: {
        userId: input.userId
      }});
    if(!userFile) throw new MainError('file', 'fileIsRequired');

    let position = await models.Position.scope(['includePositionQuestion']).findOne({
      where: {
        id: input.positionId,
        active: true,
      },
      transaction: t
    });

    if (position === null) throw new MainError('common', 'notFound');

    let candidate = await models.Candidate.findOne({
      where: {
        userId: input.userId,
        positionId: position.id,
      },
      transaction: t
    });

    if (candidate !== null && (input.isInvitation !== true || candidate.isInvitation === true)) throw new MainError('candidate', 'appliedAlready');

    if (input.isInvitation === true) {
      let positionInvitation = await models.PositionInvitation.scope(['includePositionInvitationJob', 'includeCompanyAndEnterprise']).findOne({
        where: {
          userId: input.userId,
          positionId: position.id,
          status: 'pending'
        }
      });
      // 检查是否存在 邀请纪录
      if (positionInvitation === null) throw new MainError('candidate', 'invitationNotFound');

      // 检查是否足够馀额
      if (parseInt(positionInvitation.company.enterprise.balance) < parseInt(positionInvitation.positionInvitationJob.cost)) throw new MainError('position', 'invalid');
      await positionInvitation.company.enterprise.updateAttributes({balance: (parseInt(positionInvitation.company.enterprise.balance) - parseInt(positionInvitation.positionInvitationJob.cost))}, {transaction: t});

      await positionInvitation.updateAttributes({status: 'accepted', acceptedAt: moment().format()}, {transaction: t});
      req.body.enterprise = positionInvitation.company.enterprise;

      // 插入账单
      let billAttributes = {};
      billAttributes.amount = 1;
      billAttributes.enterpriseId = req.body.enterprise.id;
      billAttributes.description = 'Through EasyBoost, user apply position.';
      billAttributes.currency = positionInvitation.positionInvitationJob.cost;
      billAttributes.type = 'invitation';
      billAttributes.billedAt = moment().format();
      await models.Bills.create(billAttributes, {transaction: t});
    }

    if (candidate !== null) {
      await candidate.updateAttributes({isInvitation: true}, {transaction: t});
    } else {
      input.positionId = position.id; // 获取当前用户的ID
      input.companyId = position.companyId; // 设置公司名称
      input.candidateStatusId = 1; // 设置默认值 1
      input.appliedAt = moment().format(); // 设置职位申请日期.
      candidate = await models.Candidate.create(input, {transaction: t});

      if (position.questions.length > 0) {
        let createAnswerPromise = [];
        for (let i = 0; i < position.questions.length; i++) {
          let val = position.questions[i];

          let answerObject = _.find(input.question, {questionId: val.id});
          if (val.isRequired === true) {
            if (_.isUndefined(answerObject) || answerObject.answer === '' || _.isUndefined(answerObject.answer)) {
              throw new MainError('candidate', 'answerRequired');
            }
          }
          if (val.isAttachment === true) {
            if (_.isUndefined(answerObject) || _.isUndefined(answerObject.attachement)) {
              throw new MainError('candidate', 'attachmentRequired');
            }
          }
          if (!_.isUndefined(answerObject)) {
            let data = {};
            data.candidateId = candidate.id;
            data.question = val.question;
            data.answer = answerObject.answer;
            createAnswerPromise.push(models.CandidateQuestion.create(data, {transaction: t}));
          }

        }
        if (createAnswerPromise.length > 0) await Promise.all(createAnswerPromise);
      }

      await models.Review.create({companyId:position.companyId,positionId:position.id,userId:input.userId},{transaction:t});
    }

    await t.commit();

    await jobs.create('email::positionApply', {
      candidate: {id: candidate.id, userId: input.userId},
      isInvitation: input.isInvitation,
    });


    req.params.candidateId = candidate.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.update = async function(req, res, next) {
  debug('Enter update method!');

  const rules = {
    candidateStatusId: 'required|integer|exists:CandidateStatus,id',
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Candidate.findOne({
      where: {
        id: req.params.candidateId,
      },
      transaction: t
    });
    if (result === null) throw new MainError('common', 'notFound');
    if(input.candidateStatusId > 2) input.isInterviewed = true;

    await result.updateAttributes(input, {transaction: t});
    await t.commit();
    req.params.candidateId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  let filter = {
    where: {
      id: req.params.candidateId
    }
  };
  try {
    let result = await models.Candidate.destroy(filter);
    if (result === null) throw new MainError('common', 'notFound');
    return res.return();
  } catch (err) {
    return next(err);
  }
};

