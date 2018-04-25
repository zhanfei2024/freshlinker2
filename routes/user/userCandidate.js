'use strict';

// core
const debug = require('debug')('APP:USER_USER_CANDIDATE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const validateHelper = require(__base + 'helpers/ValidateHelper');

const candidateRoute = require(__base + 'routes/candidate');
const methodsRoute = require(__base + 'methods/positionMethod');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);
  // Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Candidate.getReadAttributesByRole('user'));

  return candidateRoute.index(req, res, next);
};

Route.indexByApplier = async function(req, res, next) {
  debug(`ENTER index method!`);

  // Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Candidate.getReadAttributesByRole('user'));

  req.query.userId = res.locals.userAuth.id;
  return candidateRoute.indexByApplier(req, res, next);
};

Route.check = async function(req, res, next) {
  debug(`ENTER check method!`);
  req.query.userId = res.locals.userAuth.id;
  req.query.positionId = parseInt(req.params.positionId);
  return candidateRoute.check(req, res, next);
};

Route.apply = async function(req, res, next) {
  debug(`ENTER apply method!`);
  req.body.userId = res.locals.userAuth.id;
  req.body.positionId = parseInt(req.params.positionId);

  let positionResult = await models.Position.findOne({
    where: {
      id: req.body.positionId,
      active: true,
    }
  });
  if (positionResult === null) throw new MainError('common', 'notFound');

  let enterpriseResult = methodsRoute.getEnterprise(positionResult);
  if (enterpriseResult === null) throw new MainError('common', 'notFound');

  req.body.isInvitation = _.isUndefined(req.body.isInvitation) ? false : req.body.isInvitation;
  req.body.enterprise = enterpriseResult;
  return candidateRoute.create(req, res, next);
};

Route.invitationApply = async function(req, res, next) {
  debug(`ENTER invitationApply method!`);
  try {
    req.body.userId = res.locals.userAuth.id;
    req.body.isInvitation = true;
    return candidateRoute.create(req, res, next);
  } catch (err) {
    return next(err);
  }
};
