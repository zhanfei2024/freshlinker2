'use strict';

// core
const debug = require('debug')('APP:PUBLIC_POSITION_INVITATION');

// model
const models = require(__base + 'models');

// library
const moment = require('moment');

const invitationRoute = require(__base + 'routes/positionInvitation');

let Route = module.exports = {};

Route.byInvitationPosition = async function(req, res, next) {
  debug('Enter byInvitationPosition method.');

  req.query.active = true;
  req.query.minExpiredDate = moment().format('YYYY-MM-DD'); // 获取当天日期.验证职位是否过期.
  return invitationRoute.byInvitationPosition(req, res, next);
};
