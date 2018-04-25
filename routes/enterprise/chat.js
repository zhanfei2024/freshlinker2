'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_CHAT');

// library
const _ = require('lodash');
const models = require(__base + '/models');

const chatRoute = require(__base + 'routes/chat');

let Route = module.exports = {};

Route.login = async function (req, res, next) {
  debug(`Enter login method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    req.query.companyId = res.locals.companyIds[index];

    return chatRoute.login(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.index = async function (req, res, next) {
  debug(`Enter index method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    let companyId = res.locals.companyIds[index];

    let interlocutor = await models.ChatInterlocutor.findOne({where: {companyId: companyId}});

    req.query.interlocutorId = interlocutor.id;
    return chatRoute.index(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  debug(`Enter show method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    let companyId = res.locals.companyIds[index];

    let sender = await models.ChatInterlocutor.findOne({where: {companyId: companyId}});
    let receiver = await models.ChatInterlocutor.findOne({where: {userId: req.params.userId}});

    req.query.senderId = sender.id;
    req.query.receiverId = receiver.id;
    return chatRoute.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function (req, res, next) {
  debug(`Enter create method`);

  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    let companyId = res.locals.companyIds[index];

    let sender = await models.ChatInterlocutor.findOne({where: {companyId: companyId}});
    let receiver = await models.ChatInterlocutor.findOne({where: {userId: req.params.userId}});

    req.body.senderId = sender.id;
    req.body.receiverId = receiver.id;
    return chatRoute.create(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.update = async function (req, res, next) {
  debug(`Enter update method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    let companyId = res.locals.companyIds[index];

    let interlocutor = await models.ChatInterlocutor.findOne({where: {companyId: companyId}});
    let another = await models.ChatInterlocutor.findCreateFind({
      where: {userId: req.params.userId},
      defaults: {userId: req.params.userId}
    });

    req.body.interlocutorId = interlocutor.id;
    req.body.anotherId = another[0].id;
    return chatRoute.update(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function (req, res, next) {
  debug(`Enter destroy method`);
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index === -1) next(new MainError('common', 'notFound'));
    let companyId = res.locals.companyIds[index];

    let interlocutor = await models.ChatInterlocutor.findOne({where: {companyId: companyId}});
    let another = await models.ChatInterlocutor.findOne({
      where: {userId: req.params.userId}
    });

    req.body.interlocutorId = interlocutor.id;
    req.body.anotherId = another.id;
    return chatRoute.destroy(req, res, next);
  } catch (err) {
    return next(err);
  }
};

