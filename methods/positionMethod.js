'use strict';

// core
const debug = require('debug')('APP:POSITION_METHOD');
const logger = require(__base + 'modules/logger');


// model
const models = require(__base + 'models');
const jobs = require(__base + 'jobs');

// library
const moment = require('moment');
const _ = require('lodash');

const getCandidateChart = function (companyId, positionId) {
  debug('Enter getCandidateEducations method!');

  return new Promise(async function(resolve, reject) {
    let filter = {
      where: {},
      attributes: ['id'],
      include: [
        {
          model: models.User, as: 'user',
          include: [
            {
              model: models.Tag, as: 'skills',
              through: {
                model: models.Taggable, as: 'taggable',
                where: {
                  type: 'UserSkill'
                }
              },
              required: false,
            },
            {
              model: models.UserEducation, as: 'educations',
              include: [
                {model: models.EducationLevel, as: 'educationLevel'},
                {model: models.School, as: 'school'},
              ]
            }
          ]
        }
      ],
      order: [
        [
          {model: models.User, as: 'user'},
          {model: models.UserEducation, as: 'educations'},
          {model: models.EducationLevel, as: 'educationLevel'},
          'order', 'desc'
        ],
        [
          {model: models.User, as: 'user'},
          {model: models.UserEducation, as: 'educations'},
          'educationLevelId', 'asc'
        ]
      ]
    };

    if (!_.isNull(positionId)) filter.where.positionId = positionId;
    if (!_.isNull(companyId)) filter.where.companyId = companyId;

    try {
      let promiseResult = await Promise.all([models.Candidate.findAll(filter), models.EducationLevel.findAll()]);
      let candidates = promiseResult[0];
      let educationLevels = promiseResult[1];

      // education setup
      _.each(educationLevels, function (val, i) {
        educationLevels[i].setDataValue('value', 0);
      });
      educationLevels.push({
        name: 'N/A',
        value: 0
      });

      // experience setup
      let yearOfExperiences = [
        {
          name: 'More than five years',
          value: 0
        }, {
          name: 'Four years',
          value: 0
        }, {
          name: 'Three years',
          value: 0
        }, {
          name: 'Two years',
          value: 0
        }, {
          name: 'One year',
          value: 0
        }, {
          name: 'N/A',
          value: 0
        }
      ];

      // Which Skills.
      let skills = [{
        name: 'N/A',
        sum: 0
      }];
      // Which Major.
      let subject = [{
        name: 'N/A',
        sum: 0
      }];
      // which university
      let school = [{
        name: 'N/A',
        sum: 0
      }];

      _.each(candidates, function (candidate, key) {
        let educationLevelName = candidate.user.educations.length === 0 ? 'N/A' : candidate.user.educations[0].educationLevel.name;
        let educationLevel = _.find(educationLevels, {name: educationLevelName});
        if (educationLevelName === 'N/A') {
          educationLevel.value++
        } else {
          educationLevel.setDataValue('value', (educationLevel.getDataValue('value') + 1));
        }

        // which school
        let schoolName = candidate.user.educations.length == 0 ? 'N/A' : candidate.user.educations[0].school.name;
        let schoolIndex = _.findIndex(school, {name: schoolName});
        if (schoolIndex !== -1) {
          school[schoolIndex].sum++
        } else {
          school.push({'name': candidate.user.educations[0].school.name, 'sum': 1})
        }

        // Which Major.
        let subjectName = candidate.user.educations.length == 0 ? 'N/A' : candidate.user.educations[0].subject;
        let subjectIndex = _.findIndex(subject, {name: subjectName});
        if (subjectIndex !== -1) {
          subject[subjectIndex].sum++
        } else {
          subject.push({'name': candidate.user.educations[0].subject, 'sum': 1});
        }

        // Which Skills.
        _.each(candidate.user.skills, function (skill, key) {
          let skillName = _.isUndefined(skill.name) ? 'N/A' : skill.name;
          let index = _.findIndex(skills, {name: skillName});
          if (index !== -1) {
            skills[index].sum++; // 相等
          } else {
            skills.push({'name': skill.name, 'sum': 1}); // 不相等
          }
        });

        // experience setup
        if (candidate.user.yearOfExperience >= 5 || candidate.user.yearOfExperience === '5+') {
          yearOfExperiences[0].value++;
        }
        else if (candidate.user.yearOfExperience >= 4) {
          yearOfExperiences[1].value++;
        }
        else if (candidate.user.yearOfExperience >= 3) {
          yearOfExperiences[2].value++;
        }
        else if (candidate.user.yearOfExperience >= 2) {
          yearOfExperiences[3].value++;
        }
        else if (candidate.user.yearOfExperience >= 1) {
          yearOfExperiences[4].value++;
        } else {
          yearOfExperiences[5].value++;
        }

      });

      if (_.isEmpty(candidates)) {
        skills = [], subject = [], school = [];
      } else {
        if (skills.length === 1) skills = [];
        if (subject.length === 1) subject = [];
        if (school.length === 1) school = [];
      }

      return resolve({
        skills: skills,
        subject: subject,
        school: school,
        educationLevels: educationLevels,
        yearOfExperience: yearOfExperiences,
        totalCandidates: candidates.length
      });
    } catch (err) {
      return reject(err);
    }
  });
};

/**
 * @description from user query enterprise object
 * @method enterpriseResult
 * @param  {Object} position
 * @return {Object} enterprise
 * @public
 */
const getEnterpriseObj = function (position) {
  return new Promise(async function(resolve, reject) {
    try {
      let filter = {
        where: {
          id: position.companyId,
          isApproved: true,
        }
      };
      let companyResult = await models.Company.findOne(filter);
      if (companyResult === null) throw new MainError('common', 'notFound');
      let enterpriseFilter = {
        where: {
          id: companyResult.enterpriseId,
          active: true,
        }
      };
      let enterpriseResult = await models.Enterprise.findOne(enterpriseFilter);
      if (enterpriseResult === null) throw new MainError('common', 'notFound');
      return resolve(enterpriseResult);
    } catch (err) {
      return reject(err);
    }
  });
};


/**
 * @description position be overdue
 * @method positionBeOverdue
 * @param  {null}
 * @return {Promise}
 * @public
 */
const positionBeOverdue = function () {
  debug('Enter position be overdue method.');

  return new Promise(async function(resolve, reject) {
    try {
      let date = moment();
      date = date.add(7, 'd'); // 提前7天通知职位过期
      let time = date.format('YYYY-MM-DD');
      let result = await models.Position.findAll({
        where: {
          expiredDate: {
            $gte: `${time}T00:00:00.000Z`,
          },
          active: true,
        }
      });
      for (let i = 0; i < result.length; i++) {
        let enterprise = await getEnterpriseObj(result[i]);
        // send email
        jobs.create('email::positionBeOverdue', {
          enterprise: enterprise.toJSON(),
          position: {id: result[i].id}
        });

      }
      return resolve(true);
    } catch (err) {
      return reject(err);
    }
  });
};


const getUserInvitationPosition = function (userId) {
  debug('Enter user invitation position method.');
  return new Promise(async function(resolve, reject) {
    try {
      let result = await models.PositionInvitationUser.findAll({
        where: {
          userId: userId
        }
      });
      let invitationIds = [];
      _.each(result, function (val) {
        invitationIds.push(val.positionInvitationId);
      });

      let invitationResult = await models.PositionInvitation.findAll({
        where: {
          id: {
            $in: invitationIds
          }
        }
      });

      let positionIds = [];
      _.each(invitationResult, function (val) {
        positionIds.push(val.positionId);
      });
      return resolve({positionIds});
    } catch (err) {
      return reject(err);
    }
  });
};


/**
 * Method
 * @module Method
 */
let Method = module.exports = {};

/**
 * @description getCandidateEducationsByCompanyId
 * @method getCandidateEducationsByCompanyId
 * @param  {Integer} companyId
 * @return {Promise}
 * @public
 */
Method.getCandidateChartByCompanyId = function (companyId) {
  return getCandidateChart(companyId, null);
};

/**
 * @description getCandidateChartByPositionId
 * @method getCandidateChartByPositionId
 * @param  {Integer} positionId
 * @return {Promise}
 * @public
 */
Method.getCandidateChartByPositionId = function (positionId) {
  return getCandidateChart(null, positionId);
};

/**
 * @description Send expired date position information to enterprise email.
 * @method SendEmail
 * @param  {null}
 * @return {Promise}
 * @public
 */
Method.pushExpiredEmail = function () {
  return positionBeOverdue();
};

/**
 * @description Get enterprise
 * @method getEnterprise
 * @param  {Object} position
 * @return {Object}
 * @public
 */
Method.getEnterprise = function (position) {
  return getEnterpriseObj(position);
};

/**
 *  @description user invitation position.
 *  @method userInvitationPosition
 *  @return {array}
 */
Method.getUserInvitationPositiion = async function(req, res, next) {
  let userId = res.locals.userAuth.id;
  let positionIds = await getUserInvitationPosition(userId);
  return res.item(positionIds);
};
