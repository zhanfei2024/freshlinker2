'use strict';

// core
const debug = require('debug')('APP:USER_CHAT');

// models
const models = require(__base + '/models');
const chatRoute = require(__base + 'routes/chat');

let Route = module.exports = {};

Route.login = async function(req, res, next) {
  debug(`Enter login method!`);
  req.query.userId = res.locals.userAuth.id;
  return chatRoute.login(req, res, next);
};

Route.index = async function(req, res, next) {
  debug(`Enter index method!`);

  let userId = res.locals.userAuth.id;
  let interlocutor = await models.ChatInterlocutor.findOne({where:{userId:userId}});

  req.query.interlocutorId = interlocutor.id;
  return chatRoute.index(req, res, next);
};

Route.show = async function(req, res, next) {
  debug(`Enter show method!`);
  let userId = res.locals.userAuth.id;

  let sender = await models.ChatInterlocutor.findOne({where:{userId:userId}});
  let receiver = await models.ChatInterlocutor.findOne({where:{companyId:req.params.companyId}});

  req.query.senderId = sender.id;
  req.query.receiverId = receiver.id;
  return chatRoute.show(req, res, next);
};

Route.create = async function(req, res, next) {
  debug(`Enter create method!`);
  let userId = res.locals.userAuth.id;

  let sender = await models.ChatInterlocutor.findOne({where:{userId:userId}});
  let receiver = await models.ChatInterlocutor.findOne({where:{companyId:req.params.companyId}});

  req.body.senderId = sender.id;
  req.body.receiverId = receiver.id;
  return chatRoute.create(req, res, next);
};

Route.update = async function(req, res, next) {
  debug(`Enter update method!`);
  let userId = res.locals.userAuth.id;

  let interlocutor = await models.ChatInterlocutor.findOne({where:{userId:userId}});
  let another = await models.ChatInterlocutor.findCreateFind({where:{companyId:req.params.companyId},defaults:{companyId:req.params.companyId}});

  req.body.interlocutorId = interlocutor.id;
  req.body.anotherId = another[0].id;
  return chatRoute.update(req, res, next);
};

Route.destroy = async function(req, res, next) {
  debug(`Enter destroy method!`);
  let userId = res.locals.userAuth.id;

  let interlocutor = await models.ChatInterlocutor.findOne({where:{userId:userId}});
  let another = await models.ChatInterlocutor.findOne({where:{companyId:req.params.companyId}});

  req.body.interlocutorId = interlocutor.id;
  req.body.anotherId = another.id;
  return chatRoute.destroy(req, res, next);
};
