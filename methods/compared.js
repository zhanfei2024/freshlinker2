'use strict';

// core
const debug = require('debug')('APP:COMPARED');
const logger = require(__base + 'modules/logger');


// model
const models = require(__base + 'models');

// library
const moment = require('moment');
const _ = require('lodash');

/**
 * Method
 * @module Method
 */
let Method = module.exports = {};

/**
 * return compared result array
 * @type {Function}
 */
const compared = function (positionId) {
  return new Promise(async function(resolve, reject) {
    try {
      let position = await models.Position.scope(['includePositionSkills']).findById(positionId);
      if (position === null) throw new MainError('common', 'notFound');

      let candidateResult = await models.Candidate.findAll({where: {positionId: positionId}});
      if (candidateResult === null) throw new MainError('common', 'notFound');

      let positionSkills = [];
      _.each(position.skills, function (skills) {
        positionSkills.push(skills.tag.name);
      });

      let userSkills = [];
      for (let val of candidateResult) {
        let userSkillResult = await models.User.scope(['includeUserSkills']).findById(val.userId);
        let skills = [];
        _.each(userSkillResult.skills, function (userSkill) {
          skills.push(userSkill.tag.name);
        });
        userSkills.push({
          userId: userSkillResult.id,
          firstName: userSkillResult.firstName,
          lastName: userSkillResult.lastName,
          skill: skills
        });
      }

      _.each(userSkills, function (val, key) {
        let skillResult = 0;
        _.each(val.skill, function (skill) {
          let index = _.indexOf(positionSkills, skill);
          if (index !== -1) {
            userSkills[key].count = ++skillResult;
          } else {
            userSkills[key].count = skillResult;
          }
        });
      });

      userSkills = _.orderBy(userSkills, ['count'], ['desc']);
      _.each(userSkills, function (val, key) {
        let sortValue = userSkills.length * 0.5;
        val.rank = ++key;
        if (val.rank > sortValue) {
          val.isShow = false;
        } else {
          val.isShow = true;
        }
      });

      return resolve(userSkills);
    } catch (err) {
      return reject(err);
    }
  });
};

/**
 * return array
 * @type {Function}
 */
Method.skillsCompared = async function(req, res, next) {
  let positionId = req.params.positionId;
  return compared(positionId);
};
