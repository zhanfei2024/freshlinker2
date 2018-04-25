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

  let clearQuestionPromise = function (number) {
    return models.PositionQuestion.destroy({
      where: {
        id: {
          $ne: -1
        }
      }
    });
  };

  let shared = {
    position: {},
    company: {},
    educationLevel: {},
    country: {}
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
  });

  describe('Create position question', function () {

    beforeEach(async function() {
      await clearQuestionPromise();
    });
    // ===================
    // BY USER
    // ===================
    describe('by user:', function () {
      it('limit question should work', async function() {
        let data = modelHelper.faker.question();

        function createQuestion() {
          return new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/questions`)
              .send(data)
              .set('Authorization', global.data.companyAuthToken)
              .end(function (err, res) {
                resolve();
              });
          });
        }

        await Promise.all([createQuestion(), createQuestion(), createQuestion()]);

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/questions`)
            .send(data)
            .set('Authorization', global.data.companyAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.false;
              expect(res.body).to.containSubset({
                status: false,
                code: 18004
              });

              resolve();
            });
        });
      });

      describe('validation:', function () {
        it('VALIDATION: `isRequired` should be boolean', async function() {
          let data = modelHelper.faker.question();
          data.isRequired = 'abc';
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/questions`)
              .send(data)
              .set('Authorization', global.data.companyAuthToken)
              .end(function (err, res) {
                expect(res.ok).to.be.false;
                expect(res.body).to.containSubset({
                  status: false,
                });
                resolve();
              });
          });
        });
      });

      describe('field:', function () {
        let sharedForField = {
          question: {}
        };
        let data = modelHelper.faker.question();
        before(async function() {
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/questions`)
              .send(data)
              .set('Authorization', global.data.companyAuthToken)
              .end(function (err, res) {
                sharedForField.question = res.body.result;
                resolve();
              });
          });
        });

        it('`question` should work', function () {
          expect(sharedForField.question[0].question).eql(data.question);
        });

        it('`isRequired` should work', function () {
          expect(sharedForField.question[0].isRequired).eql(data.isRequired);
        });
      });
    });

  });

  describe('Update position question', function () {
  });

  describe('Delete position question', function () {
    let sharedForDeletePositionQuestion = {
      question: {}
    };
    beforeEach(async function() {
      let data = modelHelper.faker.question();
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/questions`)
          .send(data)
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
            });
            sharedForDeletePositionQuestion.question = res.body.result;
            resolve();
          });
      });
    });

    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/questions/${sharedForDeletePositionQuestion.question[0].id}`)
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            resolve();
          });
      });
    });
  });

});
