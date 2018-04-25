'use strict';

// core
const debug = require('debug')('APP:POSITION_INVITATION_METHOD');


// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const moment = require('moment');
const jobs = require(__base + 'jobs');

let Method = module.exports = {};

Method.createInvitation = function (positionId, userId, invitationJobId, companyId) {
  return new Promise(async function(resolve, reject) {
    let t = await models.sequelize.transaction();

    try {
      let user = await models.User.findOne({where: {id: userId}, transaction: t});
      if (user === null) throw new MainError('common', 'notFound');

      let positionInvitationUserResult = await models.PositionInvitation.findOne({
        where: {
          userId: userId,
          positionId: positionId,
        },
        transaction: t
      });

      // send email
      if (positionInvitationUserResult === null) {
        let attribute = {};
        attribute.positionInvitationJobId = invitationJobId;
        attribute.userId = userId;
        attribute.positionId = positionId;
        attribute.companyId = companyId ? companyId : positionInvitationUserResult.companyId;
        attribute.invitationDate = moment().format('YYYY-MM-DD');
        attribute.status = 'pending';

        let result = await models.PositionInvitation.create(attribute, {transaction: t});

        await jobs.create('email::positionInvitation', {
          user: user.toJSON(),
          positionInvitation: result.toJSON()
        });

      }
      await t.commit();
      return resolve();
    } catch (err) {
      await t.rollback();
      return reject(err);
    }
  });
};


/**
 *  @api {get} /companies/self/positionInvitations Get all the invitations information
 *  @apiName  GetInvitations
 *  @apiGroup Invitation
 *  @description  需要做企业金额 和 easyboost maxcost 金额比对.
 */
Method.matchUserAndSendInvitation = async function(req, res, next) {
  debug('ENTER index by search method!');

  try {
    // get all Position Invitation
    let result = await models.PositionInvitationJob.scope(['includePosition']).findAll({
      where: {
        active: true
      }
    });

    for (let job of result) {
      let users = [];
      if (job.position !== null) users = await Method.search(job.position.id, job.companyId);

      for (let user of users) {
        await Method.createInvitation(job.position.id, user.id, job.id, job.companyId);
      }
    }

    return res.return();
  } catch (err) {
    return next(err);
  }

};

/**
 * @description: 根据职位ID搜寻符合的人员.
 * @type {Function}
 */
Method.search = async function(positionId, companyId) {
  debug('ENTER index by search method!');

  return new Promise(async function(resolve, reject) {
    try {
      // get position invitation data
      let result = await models.PositionInvitationJob.findOne({
        where: {
          positionId: positionId,
          companyId: companyId,
          active: true
        }
      });
      if (result === null) return reject(result);
      let filter = {
        include: []
      };
      let existIncludeModel, index = 0;
      _.each(result.filter, function (val, i) {
        switch (val.type) {
          case 'salary':
            existIncludeModel = _.findIndex(filter.include, {as: 'expectJobs'});
            if (existIncludeModel === -1) {
              filter.include.push({
                model: models.UserExpectJob,
                as: 'expectJobs',
                where: {}
              });
              index = filter.include.length - 1;
            } else {
              index = existIncludeModel;
            }
            filter.include[index].where.maxSalary = {$lte: val.maxSalary};
            filter.include[index].where.minSalary = {$gte: val.minSalary};
            filter.include[index].where.salaryType = {$eq: val.salaryType};
            break;
          case 'location':
            existIncludeModel = _.findIndex(filter.include, {as: 'expectJobs'});
            if (existIncludeModel === -1) {
              filter.include.push({
                model: models.UserExpectJob,
                as: 'expectJobs',
                where: {}
              });
              index = filter.include.length - 1;
            } else {
              index = existIncludeModel;
            }
            filter.include[index].where.locationId = {$eq: val.value};
            break;
          case 'experience':
            filter.where = {
              yearOfExperience: {
                $in: val.value
              }
            };
            break;
          case 'languages':
            let languageIds = _.map(val.value, 'languageId');
            let levels = _.map(val.value, 'level');
            filter.include.push({
              model: models.UserLanguage,
              as: 'userLanguages',
              where: {
                languageId: {
                  $in: languageIds
                },
                level: {
                  $in: levels
                },
              }
            });
            break;
          case 'education':
            filter.include.push({
              model: models.UserEducation,
              as: 'educations',
              where: {}
            });
            if (!_.isUndefined(val.educationLevelId)) filter.include[filter.include.length-1].where.educationLevelId = val.educationLevelId;
            if (!_.isUndefined(val.gpa)) filter.include[filter.include.length-1].where.gpa = val.gpa;
            if (!_.isUndefined(val.graduationYear)) filter.include[filter.include.length-1].where.graduationYear = val.graduationYear;
            //filter.include[index].where.subject = val.subject;
            break;
          case 'skill':
            let skills = val.value.split(',');
            filter.include.push({
              model: models.Taggable, as: 'skills',
              include: [
                {
                  model: models.Tag, as: 'tag',
                  where: {
                    name: {
                      $in: skills
                    }
                  }
                }
              ],
              where: {
                type: "UserSkill"
              }
            });
            break;
        }
      });
      let users = await models.User.findAll(filter);
      return resolve(users);
    } catch (err) {
      return reject(err);
    }
  });
};
