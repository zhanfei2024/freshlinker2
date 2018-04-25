// core
const debug = require('debug')('APP:POSITION_QUESTION_SPEC');

// model
const models = require(__base + 'models');
const moment = require('moment');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');

describe('POSITION QUESTION', function () {
  let shared = {
    position: {},
    company: {},
    educationLevel: {},
    country: {},
    school: {},
    education: {},
    invitation: {},
    question: []
  };

  // get country
  before(function () {
    shared.country = global.data.countries[0];
  });

  // get education level
  before(function () {
    shared.educationLevel = global.data.educationLevels[0];
  });

  // create active position
  before(async function() {
    let data = modelHelper.faker.position({
      active: true,
      companyId: global.data.company.id,
      locationId: global.data.locations[1].id,
      categoryIds: [global.data.positionCategories[1].id],
      educationLevelId: shared.educationLevel.id,
      type: 'full-time',
      email:'zhengfei@yoov.com'
    });
    await new Promise(function (resolve, reject) {
      request
        .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
        .send(data)
        .set('Authorization', global.data.companyAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          expect(res.body).to.containSubset({
            status: true
          });
          shared.position = res.body.result;
          resolve();
        });
    });

    // create school
    await new Promise(function (resolve, reject) {
      request
        .post(`${commonHelper.getAdminAPIUrl()}/schools`)
        .send({
          name: 'abc',
          url: 'http://yahoo.com'
        })
        .set('Authorization', global.data.adminAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          expect(res.body).to.containSubset({
            status: true
          });
          shared.school = res.body.result;
          resolve();
        });
    });

    // create education
    let data1 = modelHelper.faker.userEducation();
    let sharedForUpdateField = {
      education: []
    };
    data1.educationLevelId = shared.educationLevel.id;
    data1.schoolId = shared.school.id;
    await new Promise(function (resolve, reject) {
      request
        .post(`${commonHelper.getUserAPIUrl()}/users/self/educations`)
        .set('Authorization', global.data.userAuthToken)
        .send(data1)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          shared.education = res.body.result;
          resolve();
        });
    });

    // update enterprise balance
    let data2 = modelHelper.faker.enterprise();
    await new Promise(function (resolve, reject) {
      request
        .put(`${commonHelper.getEnterpriseAPIUrl()}/enterprises/self`)
        .set('Authorization', global.data.companyAuthToken)
        .send(data2)
        .end(function (err, res) {
          expect(res.body).to.containSubset({
            status: true
          });
          resolve();
        });
    });
  });

  describe('Create position invitation', function () {
    // ===================
    // BY ENTERPRISE
    // ===================
    describe('by enterprise:', function () {
      it('create position question should work', async function() {

        function createQuestion() {
          let data = modelHelper.faker.question();
          return new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/questions`)
              .send(data)
              .set('Authorization', global.data.companyAuthToken)
              .end(function (err, res) {
                resolve(res.body.result);
              });
          });
        }

        shared.question[0] = await createQuestion();
        shared.question[1] = await createQuestion();
        shared.question[2] = await createQuestion();
      });

      it('create invitation position expect total price above maxCost return false', async function() {
        let data1 = {
          "companyId": global.data.company.id,
          "positionId": shared.position.id,
          "maxCost": 20,
          "filter": [
            {
              "name": "Degree",
              "type": "education",
              "educationLevelId": 3,
              "gpa": 3.0,
              "graduationYear": 2016
            },
            {
              "name": "test5",
              "type": "skill",
              "value": "test5"
            },
            {
              "name": "experience",
              "type": "experience",
              "value": "1"
            },
            {
              "name": "salary",
              "type": "salary",
              "minSalary": 3000,
              "maxSalary": 5000,
              "salaryType": "monthly"
            },
            {
              "name": "location",
              "type": "location",
              "value": 2
            }
          ]
        };
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/position_invitation_jobs`)
            .send(data1)
            .set('Authorization', global.data.companyAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.false;
              expect(res.body).to.containSubset({
                status: false
              });
              resolve();
            });
        });
      });

      it('create invitation position expect return true ', async function() {

        function createInvitation(){
          let data2 = {
            "companyId": global.data.company.id,
            "positionId": shared.position.id,
            "maxCost": 200,
            "filter": [
              {
                "name": "Degree",
                "type": "education",
                "educationLevelId": shared.education.educationLevelId,
              }
            ]
          };
          return new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/position_invitation_jobs`)
              .send(data2)
              .set('Authorization', global.data.companyAuthToken)
              .end(function (err, res) {
                expect(res.ok).to.be.true;
                expect(res.body).to.containSubset({
                  status: true
                });
                resolve(res.body.result);
              });
          });
        }
        shared.invitation = await createInvitation();
      });

      it('by user apply position and fee deduction', async function() {
        let data = {
          positionId: shared.position.id,
          question: [
            {questionId: shared.question[0].id, answer: 'aaaa'},
            {questionId: shared.question[1].id, answer: 'bbbb'},
            {questionId: shared.question[2].id, answer: 'cccc'}
          ]
        };
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/position_invitations/${shared.invitation.id}/apply`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.false;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });
      });

      it('by user apply position and fee deduction expect return false', async function() {
        let data = {
          positionId: shared.position.id,
          question: [
            {questionId: shared.question[0].id, answer: 'aaaa'},
            {questionId: shared.question[1].id, answer: 'bbbb'},
            {questionId: shared.question[2].id, answer: 'cccc'}
          ]
        };
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/position_invitations/${shared.invitation.id}/apply`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.false;
              expect(res.body).to.containSubset({
                status: false
              });
              resolve();
            });
        });
      });

    });
  });
});
