// core
const debug = require('debug')('APP:USER_LANGUAGE_SPEC');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');

describe('USER LANGUAGE', function () {

  let deleteUserLanguagePromise = function () {
    return models.UserLanguage.destroy({
      where: {
        id: {
          $ne: 0
        }
      }
    });
  };

  let shared = {
    languages: []
  };

  // get languages
  before(function () {
    shared.languages = global.data.languages;
  });

  describe('Create user language', function () {
    describe('validation:', function () {
    });

    let sharedForCreateUserLanguage = {
      userLanguage: {}
    };

    let data = {};

    afterEach(async function() {
      await deleteUserLanguagePromise();
    });
    describe('field:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/languages`)
            .send({
              languageId: shared.languages[0].id,
              level: 'elementary'
            })
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              sharedForCreateUserLanguage.userLanguage = res.body.result;
              resolve();
            });
        });
      });
      it('update `languageId` should work', function () {
        expect(sharedForCreateUserLanguage.userLanguage.languageId).eql(shared.languages[0].id);
      });
      it('update `level` should work', function () {
        expect(sharedForCreateUserLanguage.userLanguage.level).eql('elementary');
      });
    });

    it('should not allow same language', async function() {
      let data = {
        languageId: shared.languages[0].id,
        level: 'elementary'
      };
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/users/self/languages`)
          .send(data)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForCreateUserLanguage.userLanguage = res.body.result;
            resolve();
          });
      });

      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/users/self/languages`)
          .send(data)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              status: false,
              code: 11000
            });
            resolve();
          });
      });
    });
  });


  describe('List user languages', function () {
    let sharedForListUserLanguage = {
      userLanguage: {}
    };
    beforeEach(async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/users/self/languages`)
          .send({
            languageId: 5
          })
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForListUserLanguage.userLanguage = res.body.result;
            resolve();
          });
      });
    });

    afterEach(async function() {
      await deleteUserLanguagePromise()
    });


    it('get all should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/users/self/languages`)
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
    it('get one should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/users/self/languages/${sharedForListUserLanguage.userLanguage.id}`)
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

  describe('Update user language', function () {
    let sharedForUpdateUserLanguage = {
      userLanguage: {}
    };
    let data = {};
    before(function () {
      data.languageId = shared.languages[0].id;
      data.level = 'professional_working';
    });

    beforeEach(async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/users/self/languages`)
          .send({
            languageId: 5,
            level: 'limited_working'
          })
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForUpdateUserLanguage.userLanguage = res.body.result;
            resolve();
          });
      });
    });

    afterEach(async function() {
      await deleteUserLanguagePromise()
    });
    describe('filed:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getUserAPIUrl()}/users/self/languages/${sharedForUpdateUserLanguage.userLanguage.id}`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  languageId: data.languageId,
                  level: data.level
                }
              });
              resolve();
            });
        });
      });
      it('update `languageId` should work', function () {
        expect(sharedForUpdateUserLanguage.userLanguage.languageId).eql(5);
      });
      it('update `level` should work', function () {
        expect(sharedForUpdateUserLanguage.userLanguage.level).eql('limited_working');
      });
    });
  });

  describe('Delete user language', function () {
    let sharedForDeleteUserLanguage = {
      userLanguage: {}
    };
    beforeEach(async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/users/self/languages`)
          .send({
            languageId: 5
          })
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForDeleteUserLanguage.userLanguage = res.body.result;
            resolve();
          });
      });
    });
    afterEach(async function() {
      await deleteUserLanguagePromise()
    });

    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getUserAPIUrl()}/users/self/languages/${sharedForDeleteUserLanguage.userLanguage.id}`)
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
