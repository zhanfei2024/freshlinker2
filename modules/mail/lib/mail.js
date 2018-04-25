'use strict';

// core
const debug = require('debug')('APP:EMAIL_METHOD');
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
const nodemailer = require('nodemailer');

let Method = module.exports = {};

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
Method.send = async function(users, subject, html) {
  users = !_.isArray(users) ? [users] : users;

  let mailOptions = {
    from: `"${commonConfig.systemName}" <${commonConfig.systemEmail}>`,
    subject: subject,
    html: html,
  };

  // send mail
  let transporter = nodemailer.createTransport(mailConfig, {pool: true});

  logger.log('info', `starting send email...`);
  try {
    let sendEmailPromises = [];
    debug(users)
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
