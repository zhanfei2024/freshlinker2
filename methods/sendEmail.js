'use strict';

// core
const debug = require('debug')('APP:SEND_EMAIL_METHOD');
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
const emailJob = require(__base + 'jobs/Email');
const viewMethod = require(__base + 'methods/view');

let Method = module.exports = {};

const defaultTemplateData = {
  siteUrl: commonConfig.baseUrl,
  siteTitle: commonConfig.siteTitle,
  siteSupportEmail: commonConfig.email.support,
  currentYear: moment().format('YYYY')
};
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

/**
 * @description send company approved email
 * @method companyApprove
 * @param  {Object} user
 * users include be `email`, `firstName`, `lastName` fields
 * @return {Boolean}
 * @public
 */
Method.companyApprove = async function(user) {
  let path = `mail/company/approved.hbs`;
  try {
    let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
      fullName: user.firstName + ' ' + user.lastName,
    }));

    await emailJob.queue({
      users: {
        email: user.email,
        lastName: user.lastName,
        firstName: user.firstName
      },
      subject: `[${commonConfig.siteTitle}]: Your company have been approved!`,
      html: template
    });

    return Promise.resolve(template);
  } catch (err) {
    return Promise.reject(err);
  }
};


/**
 * @description send position invitation email
 * @method positionInvitation
 * @param  {Object} user
 * users include be `email`, `firstName`, `lastName` fields
 * @return {Boolean}
 * @public
 */
Method.positionInvitation = async function(user, positionInvitation) {
  let path = `mail/invitation/invitation.hbs`;

  try {
    let position = await models.Position.scope(['includeCompany']).findOne({where: {id: positionInvitation.positionId}});
    if (position === null) throw new MainError('common', 'notFound');

    let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
      fullName: user.firstName + ' ' + user.lastName,
      position: position,
      company: position.company,
      invitation: positionInvitation
    }));

    await emailJob.queue({
      user: {
        email: user.email,
        lastName: user.lastName,
        firstName: user.firstName
      },
      subject: `[${commonConfig.siteTitle}]:  An offer from the freshlinker,I need you!`,
      html: template
    });

    return Promise.resolve(template);
  } catch (err) {
    return Promise.reject(err);
  }

};


/**
 * @description send position apply email
 * @method positionApply
 * @param  {Object} enterprise
 * users include be `email`, `firstName`, `lastName` fields
 * @return {Boolean}
 * @public
 */
Method.positionApply = async function(enterprise, isInvitation, userId) {
  let path = isInvitation ? `mail/apply/invitation_apply.hbs` : `mail/apply/apply.hbs`;

  try {
    let user = await models.User.scope(['includeUserEducations', 'includeUserExpectJobs', 'includeUserExperiences']).findOne({where: {id: userId}});
    if (user === null) throw new MainError('common', 'notFound');

    let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
      fullName: enterprise.firstName + ' ' + enterprise.lastName,
      expectJob: user.expectJobs[0],
      educations: user.educations[0],
      experience: user.experiences[0],
      user: user
    }));

    let title = isInvitation ? `[${commonConfig.siteTitle}]: Position apply,from the position invitation!` : `[${commonConfig.siteTitle}]: Position apply,from the position apply!`;

    await emailJob.queue({
      users: {
        email: enterprise.email,
        lastName: enterprise.lastName,
        firstName: enterprise.firstName
      },
      subject: title,
      html: template
    });

    return Promise.resolve(template);
  } catch (err) {
    return Promise.reject(err);
  }
};


/**
 * @description send position be overdue email
 * @method positionBeOverdue
 * @param  {Object} enterprise
 * users include be `email`, `firstName`, `lastName` fields
 * @return {Boolean}
 * @public
 */
Method.positionBeOverdue = async function(enterprise, positionId) {
  let path = `mail/position/beOverdue.hbs`;

  try {
    let position = await models.Position.findOne({where: {id: positionId}});
    if (position === null) throw new MainError('common', 'notFound');

    let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
      fullName: enterprise.firstName + ' ' + enterprise.lastName,
      position: position
    }));

    await emailJob.queue({
      users: {
        email: enterprise.email,
        lastName: enterprise.lastName,
        firstName: enterprise.firstName
      },
      subject: `[${commonConfig.siteTitle}]: Position be overdue!`,
      html: template
    });

    return Promise.resolve(template);
  } catch (err) {
    return Promise.reject(err);
  }

};
