'use strict';

// core
const debug = require('debug')('APP:SETTING');
const fs = require('fs');

// model
const models = require(__base + 'models');

// library
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const jobs = require(__base + 'jobs');
const _ = require('lodash');

/**
 * Setting Route
 * @module Route
 */
let Route = module.exports = {};

/**
 * 通用发送email模块。
 * 1，可在线制作模板
 * 2.可选已做模板
 * 3.可对指定人员发送EMAIL
 * @type {Function}
 */
Route.sendAllTypeEmail = async function(req, res, next) {
  debug('Enter send all type email method!');

  const rules = {
    limit: 'integer|min:1',
    offset: 'integer|min:1',
    title: 'required|min:1|string',
    template: 'required|string|min:1',
    sendObject: 'required|string|in:allUser,allEnterprise,other|min:1',
    otherObject: 'required_when:sendObject,other|string|min:1',
    attachments: 'string|min:1'
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    // 过滤条件
    let filter = {order: [['id', 'ASC']]};
    if (!_.isUndefined(input.offset)) filter.offset = input.offset;
    if (!_.isUndefined(input.limit)) filter.limit = input.limit;
    filter.attributes = ['email'];

    // 接收人，数组。
    let users = [];

    // 根据sendObject 的选项，发送email 到不同人群。
    switch (input.sendObject) {
      case 'allUser':
        users = await models.User.findAll(filter);
        break;
      case 'allEnterprise':
        users = await models.Enterprise.findAll(filter);
        break;
      case 'other':
        input.otherObject
          .split(',')
          .forEach((email)=>{
            users.push({email: email});
          });
        break;
    }
    
    // 退订邮箱删除
    if(input.sendObject !== 'other' &&  !_.isUndefined(input.otherObject)){
      input.otherObject
        .split(',')
        .forEach((email)=>{
          if(_.findIndex(users,{email:email}) !== -1){
          users.splice(_.findIndex(users,{email:email}),1);
        }
      });
    }
    // 模板临时写入文件
    let path = `${__base}views/mail/email_temp.hbs`;
    fs.writeFileSync(path, input.template);
    
    // 数据
    let data = {
      title: input.title,
    };
    //  附件
    if(!_.isUndefined(input.attachments)){
      data.attachments = [];
      input.attachments
        .split(',')
        .forEach((name)=>{
          data.attachments.push({
            filename:name,
            path: __base + 'public/images/' + name,
          })
        });
    }
    // send email
    users.forEach((user,i)=>{
      setTimeout(()=> {
        data.email = user.email;
        jobs.create('email::customEmail', data );
      }, i*1000)
    });

    return res.return();
  } catch (err) {
    debug(err);
    return next(err);
  }
};
