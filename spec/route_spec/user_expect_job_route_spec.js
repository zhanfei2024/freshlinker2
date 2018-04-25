// core
const debug = require('debug')('APP:USER_EXPECT_JOB_SPEC');

// model
const models = require(__base + 'models');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');


describe('User expect job', function () {
  let clearJobPromise = function () {
    return models.UserExpectJob.destroy({
      where: {
        id: {
          $ne: 0
        }
      }
    });
  };

  let shared = {
    userExpectJob: {}
  };

  describe('List expect jobs', function () {
    let sharedForThis = {
      expectJob: []
    };
    before(async function() {
      await clearJobPromise();
      let data = modelHelper.faker.userExpectJob({
        locationId: global.data.locations[1].id,
        expectPositionId: global.data.positionCategories[1].id,
        jobNatureId: global.data.jobNature[0].id
      });
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/users/self/expect_jobs`)
          .send(data)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForThis.expectJob = res.body.result;
            resolve();
          });
      });
    });
    it('get all should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/users/self/expect_jobs`)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
            });
            resolve();
          });
      });
    });

    it('get one should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/users/self/expect_jobs/${sharedForThis.expectJob.id}`)
          .set('Authorization', global.data.userAuthToken)
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

  describe('Create expect job', function () {
    describe('validation:', function () {
    });
    describe('field:', function () {
      let data = {};
      let sharedForCreateField = {
        expectJob: {}
      };

      before(async function() {
        await clearJobPromise();
        data = modelHelper.faker.userExpectJob({
          locationId: global.data.locations[1].id,
          expectPositionId: global.data.positionCategories[1].id,
          jobNatureId: global.data.jobNature[0].id
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/expect_jobs`)
            .send(data)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              sharedForCreateField.expectJob = res.body.result;
              resolve();
            });
        });

      });
      it('update `type` should work', function () {
        expect(sharedForCreateField.expectJob.type).eql(data.type);
      });
      it('update `expectPosition` should work', function () {
        expect(sharedForCreateField.expectJob.expectPositionId).eql(data.expectPositionId);
      });
      it('update `salaryType` should work', function () {
        expect(sharedForCreateField.expectJob.salaryType).eql(data.salaryType);
      });
      it('update `minSalary` should work', function () {
        expect(sharedForCreateField.expectJob.minSalary).eql(data.minSalary);
      });
      it('update `maxSalary` should work', function () {
        expect(sharedForCreateField.expectJob.maxSalary).eql(data.maxSalary);
      });
      it('update `content` should work', function () {
        expect(sharedForCreateField.expectJob.content).eql(data.content);
      });
    });

  });

  describe('Update user expect job', function () {
    describe('field:', function () {
      let sharedForUpdateField = {
        expectJob: []
      };
      let data = {};
      before(async function() {
        await clearJobPromise();
        data = modelHelper.faker.userExpectJob({
          locationId: global.data.locations[1].id,
          expectPositionId: global.data.positionCategories[1].id,
          jobNatureId: global.data.jobNature[0].id
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/expect_jobs`)
            .send(data)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              sharedForUpdateField.expectJob = res.body.result;
              resolve();
            });
        });

        data = modelHelper.faker.userExpectJob({
          locationId: global.data.locations[1].id,
          expectPositionId: global.data.positionCategories[1].id,
          jobNatureId: global.data.jobNature[0].id
        });
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getUserAPIUrl()}/users/self/expect_jobs/${sharedForUpdateField.expectJob.id}`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              sharedForUpdateField.expectJob = res.body.result;
              resolve();
            });
        });
      });
      it('update `type` should work', function () {
        expect(sharedForUpdateField.expectJob.type).eql(data.type);
      });
      it('update `expectPosition` should work', function () {
        expect(sharedForUpdateField.expectJob.expectPositionId).eql(data.expectPositionId);
      });
      it('update `salaryType` should work', function () {
        expect(sharedForUpdateField.expectJob.salaryType).eql(data.salaryType);
      });
      it('update `minSalary` should work', function () {
        expect(sharedForUpdateField.expectJob.minSalary).eql(data.minSalary);
      });
      it('update `maxSalary` should work', function () {
        expect(sharedForUpdateField.expectJob.maxSalary).eql(data.maxSalary);
      });
      it('update `content` should work', function () {
        expect(sharedForUpdateField.expectJob.content).eql(data.content);
      });
    });
  });

  describe('Delete user expect job', function () {
    describe('field:', function () {
      let sharedForDeleteField = {
        expectJob: []
      };
      let data = {};
      before(async function() {
        await clearJobPromise();
        data = modelHelper.faker.userExpectJob({
          locationId: global.data.locations[1].id,
          expectPositionId: global.data.positionCategories[1].id,
          jobNatureId: global.data.jobNature[0].id
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/expect_jobs`)
            .send(data)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              sharedForDeleteField.expectJob = res.body.result;
              resolve();
            });
        });
        await new Promise(function (resolve, reject) {
          request
            .delete(`${commonHelper.getUserAPIUrl()}/users/self/expect_jobs/${sharedForDeleteField.expectJob.id}`)
            .set('Authorization', global.data.userAuthToken)
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
});
