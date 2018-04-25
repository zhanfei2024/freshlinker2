'use strict';

// core
const debug = require('debug')('APP:CHAT');

// model
const models = require(__base + 'models');

// library
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

async function login(req, res, next) {
  debug('Enter index method!');

  const rules = {
    userId:'integer|exists:User,id',
    companyId: 'integer|exists:Company,id'
  };

  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules);
  } catch (err) {
    return res.validateError2(err);
  }
  let t = await models.sequelize.transaction();
  try {
    let interlocutor = await models.ChatInterlocutor.findOne({
      where:{
        $or:[{companyId:input.companyId},{userId:input.userId}]
      }
    });

    if(interlocutor === null) interlocutor = await models.ChatInterlocutor.create(input, {transaction: t});

    await t.commit();

    return res.item(interlocutor);
  }catch(err){
    return next(err);
  }
}

async function index(req, res, next) {
  debug('Enter index method!');

  const rules = {
    interlocutorId:'integer|required'
  };
  let input = validateHelper.pick(req.query, rules);
  try {
    await indicative.validate(input, rules);
  } catch (err) {
    return res.validateError2(err);
  }
  let filter = await res.paginatorHelper.initFilter(req.query);
  let scopes = ['includeInterlocutor','includeAnother'];
  filter.where = {interlocutorId:input.interlocutorId};
  try{
    const result = await models.Chat.scope(scopes).findAll(filter);
    return res.collection(result);
  }catch(err){
    return next(err);
  }
}

async function show(req, res, next) {
  debug('Enter show method!');
  const rules = {
    senderId:'integer|required',
    receiverId:'integer|required',
  };
  let input = validateHelper.pick(req.query, rules);
  try {
    await indicative.validate(input, rules);
  } catch (err) {
    return res.validateError2(err);
  }
  let filter = await res.paginatorHelper.initFilter(req.query);
  filter.where = {
    $or:[{senderId:input.senderId,receiverId:input.receiverId},
      {senderId:input.receiverId,receiverId:input.senderId}]
  };
  filter.order = [['createdAt','DESC']];
  try{
    const result = await models.ChatMessage.findAndCountAll(filter);
    return res.collection(result);
  }catch(err){
    return next(err);
  }
}

async function create (req, res, next) {
  debug('Enter create method!');
  const rules = {
    senderId:'integer|required',
    receiverId:'integer|required',
    message:'required|min:1',
    isRead:'boolean'
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let chat = await models.Chat.findOne({
      where:{interlocutorId:input.receiverId,anotherId:input.senderId}
    });
    if(chat === null){
      await models.Chat.create({interlocutorId:input.receiverId,anotherId:input.senderId},{transaction:t});
    }

    let result = await models.ChatMessage.create(input, {transaction: t});

    await t.commit();

    return res.item(result);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

}

async function update(req, res, next) {
  debug('Enter update method!');
  const rules = {
    interlocutorId:'integer|required',
    anotherId:'integer|required',
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Chat.findOne({
      where:{interlocutorId:input.interlocutorId,anotherId:input.anotherId}
    });
    input.isEnter = true;
    if(result === null){
      result = await models.Chat.create(input,{transaction:t});
    }else{
      result = await result.updateAttributes(input,{transaction:t});
    }

    let messages = await models.ChatMessage.findAll({where:{receiverId:input.interlocutorId,senderId:input.anotherId,isRead:false}});
    if(messages.length>0){
      let allPromise = [];
      messages.forEach(function(message) {
        allPromise.push(message.updateAttributes({isRead:true}));
      });

      await Promise.all(allPromise);
    }

    await t.commit();

    return res.item(result);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
}

async function destroy(req, res, next) {
  debug('Enter destroy method!');
  const rules = {
    interlocutorId:'integer|required',
    anotherId:'integer|required',
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let result = await models.Chat.findOne({
      where:{interlocutorId:input.interlocutorId,anotherId:input.anotherId}
    });

    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy();
    return res.return();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  index,
  show,
  create,
  update,
  destroy
};
