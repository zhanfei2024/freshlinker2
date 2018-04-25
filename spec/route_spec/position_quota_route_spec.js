// core
const debug = require('debug')('APP:POSITION_QUOTA');

// model
const models = require(__base + 'models');

// test lib
const request = require('superagent');
let moment = require('moment');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');

describe('PLAN', function () {

  let updateEnterpriseBalance = function (balance) {
    // update
    return new Promise(function (resolve, reject) {
      request
        .put(`${commonHelper.getAdminAPIUrl()}/enterprises/${global.data.company.id}`)
        .send({
          balance: balance
        })
        .set('Authorization', global.data.adminAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          resolve();
        });
    });
  };

  let shared = {
    enterprise: {},
  };

  let updateEnterprise = function (date) {
    // update
    return new Promise(function (resolve, reject) {
      request
        .put(`${commonHelper.getAdminAPIUrl()}/enterprises/${global.data.company.id}`)
        .send({
          planExpiredDate: moment(date).format('YYYY-MM-DD'),
        })
        .set('Authorization', global.data.adminAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          resolve();
        });
    });
  };

  before(async function() {
    await updateEnterprise('2016-12-10');
  });

  before(async function() {
    await updateEnterpriseBalance(999999);
  });
  describe('buy plan', function () {
    it('positionQuota=0 if planExpiredDate expired.', async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/positionQuotas`)
          .send({
            planId: 1
          })
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
            });
            resolve();
          });
      });

      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getEnterpriseAPIUrl()}/enterprises/self`)
          .send({
            id:shared.enterprise.id
          })
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
              result:{
                "positionQuota": 1002,
              }
            });
            resolve();
          });
      });
    });
  });

  describe('by enterprise', function () {

    it('add plan should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/positionQuotas`)
          .send({
            planId: 2
          })
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
            });
            resolve();
          });
      });
    });

    it('should enough balance', async function() {
      await updateEnterpriseBalance(0);
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/positionQuotas`)
          .send({
            planId: 2
          })
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              status: false,
              code: 11004
            });
            resolve();
          });
      });
    });

    it('disallowRepeatBuy', async function() {
      await updateEnterpriseBalance(23232);
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/positionQuotas`)
          .send({
            planId: 0
          })
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              status: false,
              code: 40021
            });
            resolve();
          });
      });
    });

  });
});
