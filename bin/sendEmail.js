#!/usr/bin/env node

// ***************************************
// CORE INIT BEGIN
// ***************************************
// path setup
global.__base = __dirname + '/../';
// Config Init
let envPath = '.env';
if (process.env.NODE_ENV !== 'production')
  envPath = `.env.${process.env.NODE_ENV || 'development'}`;

require('dotenv').config({
  path: envPath
});

// ***************************************
// CORE INIT END
// ***************************************

const debug = require('debug')('APP:SEND_EMAL');
const logger = require(__base + 'modules/logger');
const fs = require('fs');
const hbs = require('hbs');

// config
const commonConfig = require(__base + 'config/common');
const mailConfig = require(__base + 'config/mail');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const moment = require('moment');
const nodemailer = require('nodemailer');

/**
 * @description send email
 * @method send
 * @param  {Array<Object>|Object} users
 * users include be `email`, `firstName`, `lastName` fields
 * @param  {String} subject
 * @param  {String} html
 * @return {Promise}
 * @private
 */
const sendMail = async function (users, subject, html) {
  users = !_.isArray(users) ? [users] : users;

  let mailOptions = {
    from: `"${commonConfig.systemName}" <${commonConfig.systemEmail}>`,
    subject: subject,
    html: html,
    attachments: [{
      filename: 'summer.png',
      path: `${__base}views/mail/activity/summer.png`,
    }]
  };

  // send mail
  let transporter = nodemailer.createTransport(mailConfig, {pool: false});

  logger.log('info', `starting send email...`);
  try {
    let sendEmailPromises = [];
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      let promise = new Promise(function (resolve, reject) {
        if (_.isUndefined(user.email)) return reject('invalid email');
        transporter.sendMail(
          _.extend(mailOptions, {
            to: `"${user.firstName} ${user.lastName}" <${user.email}>`
          }),
          function (err, info) {
            if (err) {
              logger.log('error', `failed to send to ${user.email}`, err);
              return reject(err);
            }
            logger.log('info', `sent to ${user.email}`, info);
            return resolve(info);
          }
        );
      });
      sendEmailPromises.push(promise);
    }
    return Promise.all(sendEmailPromises);
  } catch (err) {
    debug(err);
  }
};

let j = 0;
let i = 0;
let send = async function(user) {
  let templateFileName = `activity/summer.hbs`;
  let source = fs.readFileSync(__base + 'views/mail/' + templateFileName);
  let template = hbs.compile(source.toString());
  try {
    await sendMail([{
        email: user.email,
        password: user.password,
        name: user.name
      }],
      `【${commonConfig.siteTitle}】：Summer Internship to London!`,
      template({
        password: user.password,
        email: user.email,
        siteName: commonConfig.siteTitle,
        siteSupportEmail: commonConfig.email.support
      }));
    debug('Number:', ++j);
    return Promise.resolve('done');
  } catch (err) {
    debug('Number:', ++i, user.id);
    return Promise.reject(err);
  }
};

(async function() {
  try {
    let filter = {
      offset: 0,// 0 - 50 - 100 - 150 - 200 - 250 - 300
      limit: 50,
      order: [['id', 'asc']]
    };
    let data = await models.User.findAll(filter);
    // let data = await models.Enterprise.findAll(filter);

    // let data = [
    //   {email:'jianmin.wan@yoov.com'},
    //   {email:'zhengfei@yoov.com'},
    // ];
    for (let i = 0; i < data.length; i++) {
      let user = data[i];
      setTimeout(function () {
        send(user).then(function () {
          debug('....', user.id);
        }, function (err) {
          debug(err);
        });
      }, i * 500)
    }
  } catch (err) {
    debug(err);
    return next(err);
  }
})();
