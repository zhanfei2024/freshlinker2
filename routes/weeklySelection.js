'use strict';

// core
const debug = require('debug')('APP:SETTING');

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
 * 每周精选
 * @type {Function}
 */
Route.sendNewsletter = async function(req, res, next) {
  debug('Enter send newsletter method!');

  const rules = {
    positionIds: 'string',
    postIds: 'string',
    limit: 'integer',
    offset: 'integer',
    sendObject: 'required|string|in:allUser,other|min:1',
    otherObject: 'string|min:1'
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let positionScope = ['includeCompany', 'includeEducation'];
    let postScope = ['includeCompany', 'includeCover', 'includeUser', 'includePostTags'];
    
    let positionIds = input.positionIds.split(',');
    let postIds = input.postIds.split(',');

    let positions = await models.Position.scope(positionScope).findAll({
      where: {
        id: {
          $in: positionIds,
        }
      }
    });

    let posts = await models.Post.scope(postScope).findAll({
      where: {
        id: {
          $in: postIds,
        }
      }
    });
    let positionsUrls = [];
    let contents = [];
    _.each(positions, function (val, i) {
      if (val.company.icon !== null){
        positionsUrls[i] = val.company.icon.key;
      } else{
        positionsUrls[i] = null;
      }
    });
    let postUrls = [];
    _.each(posts, function (val, i) {
      if (val.cover !== null){
        postUrls[i] = val.cover.key;
      } else{
        postUrls[i] = null;
      }
      contents[i] = posts[i].content.replace(/<.*?>/ig, "");
    });
    let result = {positions, posts};

    // 设置过滤条件
    let filter = {order: [['id', 'asc']]};
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
  
    // send email
    let data = {
      result: result,
      positionUrls: positionsUrls,
      postUrls: postUrls,
      contents: contents
    };
    users.forEach((user,i)=>{
      setTimeout(function () {
        data.user = user;
        jobs.create('email::newsletter', data);
      }, i * 1000)
    });
    return res.return();
  } catch (err) {
    return next(err);
  }
};
