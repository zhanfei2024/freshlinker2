'use strict';

// core
const debug = require('debug')('APP:IO');

// models
const models = require(__base + '/models');

// lib
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

module.exports = function (io) {

  // socket事件
  io.on('connection', (socket) => {
    const socketId = socket.id;

    //监听用户登录
    socket.on('login', async (data) => {
      //保存用户的id和socketid
      data.socketId = socketId;
      let interlocutor = await saveSocketId(data);
      io.to(socketId).emit('login', interlocutor);
    });

    //监听用户刷新
    socket.on('update', async (data) => {
      //保存用户的id和socketid
      data.socketId = socketId;
      let interlocutor = await saveSocketId(data);
      io.to(socketId).emit('update', interlocutor);
    });

    //监听用户发私聊消息
    socket.on('sendPrivateMessage', async (data) => {
      //根据用户的id取到socketid，从而实现只对该用户推送新消息
      const [receiver, err] = await getSocketId(data);
      data.receiverId = receiver.id;
      if (err === null) {
        io.to(receiver.socketId).emit('receivePrivateMessage', data);
        io.to(socketId).emit('receivePrivateMessage', data);
      } else {
        data.err = err;
        io.to(socketId).emit('receivePrivateMessage', data);
      }
    });

    //监听用户断开连接
    socket.on('disconnect', async () => {
      //保存用户的id和socketid
      await cleanSocketId(socketId);
    });

  });
};

async function saveSocketId(data) {
  debug('Enter saveSocketId method!');

  const rules = {
    socketId: 'string',
    userId: 'integer|exists:User,id',
    companyId: 'integer|exists:Company,id'
  };

  let input = validateHelper.pick(data, rules);

  try {
    await indicative.validate(input, rules);
  } catch (err) {
    return err;
  }
  let t = await models.sequelize.transaction();
  try {
    let interlocutor = await models.ChatInterlocutor.update({socketId: input.socketId},
      {
        where: {$or: [{companyId: input.companyId}, {userId: input.userId}]},
        fields: ['socketId'], transaction: t
      });
    await t.commit();

    return interlocutor;
  } catch (err) {
    await t.rollback();
    return err;
  }
}

async function getSocketId(data) {
  debug('Enter getSocketId method!');
  const rules = {
    userId: 'integer|exists:User,id',
    companyId: 'integer|exists:Company,id'
  };
  const input = validateHelper.pick(data, rules);
  try {
    await indicative.validate(input, rules);
  } catch (err) {
    return [{id: 0}, err];
  }

  let t = await models.sequelize.transaction();
  try {
    let receiver;
    if (!input.userId) {
      receiver = await models.ChatInterlocutor.findOrCreate({
        where: {companyId: input.companyId},
        defaults: input, transaction: t
      });
    } else {
      receiver = await models.ChatInterlocutor.findOrCreate({
        where: {userId: input.userId},
        defaults: input, transaction: t
      });
    }
    await t.commit();

    let err = null;
    if (receiver[0].socketId === null) {
      err = 'SocketId is null';
    }
    return [receiver[0], err];
  } catch (err) {
    await t.rollback();
    return [{id: 0}, err];
  }
}

async function cleanSocketId(id) {
  debug('Enter cleanSocketId method!');

  let t = await models.sequelize.transaction();
  try {
    let result = await models.ChatInterlocutor.findOne({where: {socketId: id}});
    await result.updateAttributes({socketId: null}, {transaction: t});

    let chats = await models.Chat.findAll({where: {interlocutorId: result.id, isEnter: true}});
    if (chats.length > 0) {
      let allPromise = [];
      chats.forEach((chat) => {
        allPromise.push(chat.updateAttributes({isEnter: false}, {transaction: t}));
      });
      await Promise.all(allPromise);
    }

    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    return err;
  }
}
