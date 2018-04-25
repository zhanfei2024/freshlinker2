// core
const debug = require('debug')('APP:ENTERPRISE_SPEC');

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

describe('ENTERPRISE', function () {

  let recoveryRolePromise = function () {
    return models.Plan.update({
      meta: [{"price": 0, "expiredDate": 30, "positionNum": 1, "planExpiredDate": 0}]
    }, {
      where: {name: 'lite'}
    });
  };

  before(async function() {
    await recoveryRolePromise();
  });

  let shared = {
    enterprise: {},
    educationLevel: {},
  };

  // get education level
  before(function () {
    shared.educationLevel = global.data.educationLevels[0];
  });


  describe('show enterprise', function () {
    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getEnterpriseAPIUrl()}/enterprises/self`)
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

  describe('update enterprise', function () {

    describe('by admin:', function () {
      describe('validation:', function () {

      });
      describe('field:', function () {
        let data = modelHelper.faker.enterprise();
        let sharedForUpdateEnterprise = {
          enterprise: []
        };
        before(async function() {
          await new Promise(function (resolve, reject) {
            request
              .put(`${commonHelper.getEnterpriseAPIUrl()}/enterprises/self`)
              .set('Authorization', global.data.companyAuthToken)
              .send(data)
              .end(function (err, res) {
                expect(res.ok).to.be.true;
                sharedForUpdateEnterprise.enterprise = res.body.result;
                resolve();
              });
          });
        });
        it('update `active` should work', function () {
          expect(sharedForUpdateEnterprise.enterprise.active).eql(data.active);
        });
        it('update `lastName` should work', function () {
          expect(sharedForUpdateEnterprise.enterprise.lastName).eql(data.lastName);
        });
        it('update `firstName` should work', function () {
          expect(sharedForUpdateEnterprise.enterprise.firstName).eql(data.firstName);
        });
        it('update `email` should work', function () {
          expect(sharedForUpdateEnterprise.enterprise.email).eql(data.email);
        });
      });
    });

    describe('by enterprise:', function () {
      it('should not allow to edit `active`', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getEnterpriseAPIUrl()}/enterprises/self`)
            .set('Authorization', global.data.companyAuthToken)
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
