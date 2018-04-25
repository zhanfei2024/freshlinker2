// core
const debug = require('debug')('APP:TASK_EMAL');
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
const viewMethod = require(__base + 'methods/view');
const cluster = require('cluster');
const defaultTemplateData = {
  siteUrl: commonConfig.baseUrl,
  sourceUrl:commonConfig.sourceUrl,
  siteTitle: commonConfig.siteTitle,
  siteSupportEmail: commonConfig.email.support,
  currentYear: moment().format('YYYY')
};

const prefix = 'email';

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
const sendMail = async function(users, subject, html, attachments) {
  users = !_.isArray(users) ? [users] : users;

  let mailOptions = {
    from: `"${commonConfig.systemName}" <${commonConfig.systemEmail}>`,
    subject: subject,
    html: html
  };
  if(!_.isUndefined(attachments)){
    attachments = !_.isArray(attachments) ? [attachments] : attachments;
    mailOptions.attachments = attachments;
  }

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
            to: `<${user.email}>`
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

module.exports = function (queue) {

  /**
   * @description send an email to admin, notify have as company apply.
   * @method companyApply
   * @return {Boolean}
   * @public
   */
  queue.process(`${prefix}::companyApply`, 1, function (job, done) {
    debug('running task companyApply...');
    let send = async function() {
      let data = job.data;

      let path = `mail/company/apply.hbs`;
      try {
        let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
          company: data.company.name
        }));

        await sendMail({
            email: 'hello@freshlinker.com'
          },
          `[${commonConfig.siteTitle}]: Notify! The company opened the application.`,
          template
        );

        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    };

    send().then(function () {
      done();
    }, function (err) {
      done(err);
    });
  });


  /**
   * @description send company approved email
   * @method companyApprove
   * @param  {Object} user
   * users include be `email`, `firstName`, `lastName` fields
   * @return {Boolean}
   * @public
   */
  queue.process(`${prefix}::companyApprove`, 1, function (job, done) {
    debug('running task companyApprove...');
    let send = async function() {
      let data = job.data;

      let path = `mail/company/approved.hbs`;
      try {
        let enterprise = await models.Enterprise.scope(['includeCompanies']).findOne({where: {id: data.enterprise.id}});
        if (enterprise === null) throw new MainError('common', 'notFound');

        let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
          fullName: enterprise.firstName + ' ' + enterprise.lastName,
          company: enterprise.companies[0],
          email: enterprise.email,
        }));

        await sendMail({
            email: enterprise.email,
            lastName: enterprise.lastName,
            firstName: enterprise.firstName
          },
          `[${commonConfig.siteTitle}]: Congratulations! Your Company is approved.`,
          template
        );

        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    };

    send().then(function () {
      done();
    }, function (err) {
      done(err);
    });
  });

  /**
   * @description send position invitation email
   * @method positionInvitation
   * @param  {Object} user
   * users include be `email`, `firstName`, `lastName` fields
   * @return {Boolean}
   * @public
   */
  queue.process(`${prefix}::positionInvitation`, 1, function (job, done) {
    debug('running task positionInvitation...');
    let send = async function() {
      let data = job.data;

      let path = `mail/invitation/invitation.hbs`;

      try {
        data.user = await models.User.findOne({where: {id: data.user.id}});
        if (data.user === null) throw new MainError('common', 'notFound');

        let positionInvitation = await models.PositionInvitation.scope(['includeCompany', 'includePosition']).findOne({where: {id: data.positionInvitation.id}});
        if (positionInvitation === null) throw new MainError('common', 'notFound');

        let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
          fullName: data.user.firstName + ' ' + data.user.lastName,
          position: positionInvitation.position,
          company: positionInvitation.company,
          invitation: positionInvitation,
          email: data.user.email
        }));

        await sendMail({
            email: data.user.email,
            lastName: data.user.lastName,
            firstName: data.user.firstName
          },
          `[${commonConfig.siteTitle}]:【FreshLinker】Have a company invited you to apply for position.`,
          template
        );

        return Promise.resolve(template);
      } catch (err) {
        return Promise.reject(err);
      }
    };

    send().then(function () {
      done();
    }, function (err) {
      done(err);
    });
  });


  /**
   * @description send position apply email
   * @method positionApply
   * @param  {data} {
   * candidate : {id: integer},
   * isInvitation: boolean
   * @return {Boolean}
   * @public
   */
  queue.process(`${prefix}::positionApply`, 1, function (job, done) {
    debug('running task positionApply...');
    let send = async function() {
      let data = job.data;
      let path = data.isInvitation ? `mail/apply/invitation_apply.hbs` : `mail/apply/apply.hbs`;

      try {
        // get data
        data.user = await models.User.scope(['includeUserEducations', 'includeUserExpectJobs', 'includeUserExperiences']).findOne({where: {id: data.candidate.userId}});
        if (data.user === null) throw new MainError('common', 'notFound');

        data.candidate = await models.Candidate.scope(['includeCompanyAndEnterprise', 'includePosition']).findOne({where: {id: data.candidate.id}});
        if (data.candidate === null) throw new MainError('common', 'notFound');

        let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
          company: data.candidate.company,
          position: data.candidate.position,
          enterpriseFullName: data.candidate.company.enterprise.firstName + ' ' + data.candidate.company.enterprise.lastName,
          fullName: data.user.email,
          expectJob: data.user.expectJobs[0],
          educations: data.user.educations[0],
          experience: data.user.experiences[0],
          user: data.user,
          email: data.candidate.company.enterprise.email
        }));

        await sendMail({
            email: data.candidate.company.enterprise.email,
            lastName: data.candidate.company.enterprise.lastName,
            firstName: data.candidate.company.enterprise.firstName
          },
          data.isInvitation ? `[${commonConfig.siteTitle}]: 【FreshLinker EasyBoost】You have a new applicant.` : `[${commonConfig.siteTitle}]: 【FreshLinker】You have a new applicant.`,
          template
        );

        return Promise.resolve(template);
      } catch (err) {
        return Promise.reject(err);
      }
    };

    send().then(function () {
      done();
    }, function (err) {
      done(err);
    });
  });


  /**
   * @description send position be overdue email
   * @method positionBeOverdue
   * @param  {Object} enterprise
   * users include be `email`, `firstName`, `lastName` fields
   * @return {Boolean}
   * @public
   */
  queue.process(`${prefix}::positionBeOverdue`, 1, function (job, done) {
    debug('running task positionBeOverdue...');
    let send = async function() {
      let data = job.data;

      let path = `mail/position/beOverdue.hbs`;

      try {
        data.position = await models.Position.findOne({where: {id: data.position.id}});
        if (data.position === null) throw new MainError('common', 'notFound');

        data.enterprise = await models.Enterprise.findOne({where: {id: data.enterprise.id}});
        if (data.enterprise === null) throw new MainError('common', 'notFound');

        let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
          fullName: data.enterprise.firstName + ' ' + data.enterprise.lastName,
          position: data.position
        }));

        await sendMail({
            email: data.enterprise.email,
            lastName: data.enterprise.lastName,
            firstName: data.enterprise.firstName
          },
          `[${commonConfig.siteTitle}]: ：【FreshLinker】Your Job position is about to expire`,
          template
        );

        return Promise.resolve(template);
      } catch (err) {
        return Promise.reject(err);
      }
    };

    send().then(function () {
      done();
    }, function (err) {
      done(err);
    });
  });

  /**
   * 每周精选
   */
  queue.process(`${prefix}::newsletter`, 1, function (job, done) {
    debug('running task newsletter...');
    let send = async function() {
      let data = job.data;

      // data
      let positions = data.result.positions;
      let posts = data.result.posts;
      let positionUrls = data.positionUrls;
      let postUrls = data.postUrls;
      let contents = data.contents;

      let positions1 = [];
      let positions2 = [];
      _.each(positionUrls, function (val, i) {
        if (positionUrls !== null) positions[i].urlKey = val;
        if (i < 3) {
          positions1[i] = positions[i];
        } else {
          positions2[i - 3] = positions[i];
        }
      });

      _.each(postUrls, function (val, i) {
        if (postUrls !== null) posts[i].urlKey = val;
        posts[i].text = contents[i].slice(0, 50);
      });

      let path = `mail/newsLetter.hbs`;
      try {
        let template = await viewMethod.inlineCssCompile(path, {
          positions1: positions1,
          positions2: positions2,
          posts: posts,
        });

        await sendMail({
            email: data.user.email,
          },
          `FreshLinker 每週精選`,
          template
        );

        return Promise.resolve(template);
      } catch (err) {
        return Promise.reject(err);
      }
    };

    send().then(function () {
      done();
    }, function (err) {
      done(err);
    });
  });

  /**
   * 自定义模板，发送email
   */
  queue.process(`${prefix}::customEmail`, 1, function (job, done) {
    debug('running task custom email...');

    let send = async function() {
      let data = job.data;
      let path = 'mail/email_temp.hbs';
      try {
        let template = await viewMethod.inlineCssCompile(path, {
          email: data.email
        });
        await sendMail({
            email: data.email,
          },
          `${data.title}`,
          template,
          data.attachments
        );
        return Promise.resolve(template);
      } catch (err) {
        return Promise.reject(err);
      }
    };

    send().then(function () {
      done();
    }, function (err) {
      done(err);
    });
  });

  /**
   * 申请加入公司
   */
  queue.process(`${prefix}::userCompanyApply`, 1, function (job, done) {
    debug('running task userCompanyApply...');
    let send = async function() {
      let data = job.data;

      let path = `mail/userCompany/apply.hbs`;
      try {
        let enterprise = await models.Enterprise.scope(['includeCompanies']).findOne({where: {id: data.company.enterpriseId}});
        if (enterprise === null) throw new MainError('common', 'notFound');

        let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
          fullName: enterprise.firstName + ' ' + enterprise.lastName,
          email: enterprise.email,
        }));

        await sendMail({
            email: enterprise.email,
            lastName: enterprise.lastName,
            firstName: enterprise.firstName
          },
          `[${commonConfig.siteTitle}]: Someone applied to join your company.`,
          template
        );

        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    };

    send().then(function () {
      done();
    }, function (err) {
      done(err);
    });
  });

  /**
   * 加入公司申请通過
   */
  queue.process(`${prefix}::userCompanyApproved`, 1, function (job, done) {
    debug('running task userCompanyApproved...');
    let send = async function() {
      let data = job.data;

      let path = `mail/userCompany/approved.hbs`;
      try {
        let user = await models.User.findOne({where: {id: data.result.userId}});
        if (user === null) throw new MainError('common', 'notFound');

        let template = await viewMethod.inlineCssCompile(path, _.extend(defaultTemplateData, {
          fullName: user.firstName + ' ' + user.lastName,
          email: user.email,
        }));

        await sendMail({
            email: user.email,
            lastName: user.lastName,
            firstName: user.firstName
          },
          `[${commonConfig.siteTitle}]: Congratulations! Your application to the company was passed.`,
          template
        );

        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    };

    send().then(function () {
      done();
    }, function (err) {
      done(err);
    });
  });

};

