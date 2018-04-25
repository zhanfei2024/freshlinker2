// core
const debug = require('debug')('APP:USER_SPEC');

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

describe('USER', function () {

  describe('show user', function () {
    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/users/self`)
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

    it('should include `skills`', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/users/self`)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body.result).to.have.property('skills');
            resolve();
          });
      });
    });
  });

  describe('update user', function () {

    describe('by admin:', function () {
      describe('validation:', function () {

      });
      describe('field:', function () {
        let data = modelHelper.faker.user();
        let sharedForUpdateUser = {
          user: []
        };
        before(async function() {
          data.nationalityId = global.data.countries[0].id;

          data.skills = [
            {
              name: 'a'
            },
            {
              name: 'b'
            }];
          await new Promise(function (resolve, reject) {
            request
              .put(`${commonHelper.getUserAPIUrl()}/users/self`)
              .set('Authorization', global.data.userAuthToken)
              .send(data)
              .end(function (err, res) {
                expect(res.ok).to.be.true;
                sharedForUpdateUser.user = res.body.result;
                resolve();
              });
          });
        });
        it('update `active` should work', function () {
          expect(sharedForUpdateUser.user.active).eql(data.active);
        });
        it('update `profilePrivacy` should work', function () {
          expect(sharedForUpdateUser.user.profilePrivacy).eql(data.profilePrivacy);
        });
        it('update `selfDescription` should work', function () {
          expect(sharedForUpdateUser.user.selfDescription).eql(data.selfDescription);
        });
        it('update `nationalityId` should work', function () {
          expect(sharedForUpdateUser.user.nationalityId).eql(data.nationalityId);
        });
        //it('update `birth` should work', function () {
        //  expect(sharedForUpdateUser.user.birth).eql(`${data.birth}T00:00:00.000Z`);
        //});
        it('update `lastName` should work', function () {
          expect(sharedForUpdateUser.user.lastName).eql(data.lastName);
        });
        it('update `firstName` should work', function () {
          expect(sharedForUpdateUser.user.firstName).eql(data.firstName);
        });
        it('update `email` should work', function () {
          expect(sharedForUpdateUser.user.email).eql(data.email);
        });
        it('update `gender` should work', function () {
          expect(sharedForUpdateUser.user.gender).eql(data.gender);
        });
        it('update `skill` should work', function () {
          expect(sharedForUpdateUser.user.skills).to.containSubset([
            {
              name: 'a'
            },
            {
              name: 'b'
            }
          ]);
        });
      });
    });

    describe('by user:', function () {
      it('should not allow to edit `active`', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getUserAPIUrl()}/users/self`)
            .set('Authorization', global.data.userAuthToken)
            .send({
              active: false
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body.result.active).eql(true);
              resolve();
            });
        });
      });
    });

  });

});
