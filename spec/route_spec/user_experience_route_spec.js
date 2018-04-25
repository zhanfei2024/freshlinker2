// core
const debug = require('debug')('APP:USER_EXPERIENCE_SPEC');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');


describe('User experience', function () {

  let shared = {
    userExperience: {}
  };


  describe('List user experiences', function () {
    it('GET /User experience should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/users/self/experiences`)
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

  describe('Create user experience', function () {
    describe('validation:', function () {
    });

    describe('field:', function () {
      let data = modelHelper.faker.userExperience();
      let sharedForUpdateField = {
        experience: []
      };
      before(async function() {

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/experiences`)
            .send(data)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              sharedForUpdateField.experience = res.body.result;
              resolve();
            });
        });
      });
      it('update `companyName` should work', function () {
        expect(sharedForUpdateField.experience.companyName).eql(data.companyName);
      });
      it('update `title` should work', function () {
        expect(sharedForUpdateField.experience.title).eql(data.title);
      });
      it('update `description` should work', function () {
        expect(sharedForUpdateField.experience.description).eql(data.description);
      });
      it('GET /User experience show should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/users/self/experiences/${sharedForUpdateField.experience.id}`)
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

  describe('Update user experience', function () {
    describe('field:', function () {

      let data = modelHelper.faker.userExperience();
      let sharedForUpdateField = {
        experience: []
      };
      before(async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/experiences`)
            .send(data)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              sharedForUpdateField.experience = res.body.result;
              resolve();
            });
        });

        data = modelHelper.faker.userExperience();
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getUserAPIUrl()}/users/self/experiences/${sharedForUpdateField.experience.id}`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              sharedForUpdateField.experience = res.body.result;
              resolve();
            });
        });
      });

      it('update `companyName` should work', function () {
        expect(sharedForUpdateField.experience.companyName).eql(data.companyName);
      });
      it('update `title` should work', function () {
        expect(sharedForUpdateField.experience.title).eql(data.title);
      });
      it('update `description` should work', function () {
        expect(sharedForUpdateField.experience.description).eql(data.description);
      });
    });
  });


  describe('Delete user experience', function () {
    let sharedForUpdateField = {
      experience: []
    };
    beforeEach(async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/users/self/experiences`)
          .send(data)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForUpdateField.experience = res.body.result;
            resolve();
          });
      });
    });

    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getUserAPIUrl()}/users/self/experiences/${sharedForUpdateField.experience.id}`)
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
