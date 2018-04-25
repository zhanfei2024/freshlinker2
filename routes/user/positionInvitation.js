'use strict';

// core
const debug = require('debug')('APP:USER_POSITION_INVITATION');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const moment = require('moment');
const validateHelper = require(__base + 'helpers/ValidateHelper');

const positionInvitationRoute = require(__base + 'routes/positionInvitation');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER by user index method!`);
  // Read Attribute ACL
  req.query.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.PositionInvitation.getReadAttributesByRole('user'));
  req.query.userId = res.locals.userAuth.id;
  return positionInvitationRoute.index(req, res, next);
};

Route.reject = async function(req, res, next) {
  debug(`ENTER user reject invitation position method!`);
  try {
    let result = await models.PositionInvitation.findOne({
      where: {
        userId: res.locals.userAuth.id,
        id: req.params.positionInvitationId
      }
    });
    if (result === null) throw new MainError('common', 'notFound');

    req.body.status = 'rejected';
    return positionInvitationRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }
};
