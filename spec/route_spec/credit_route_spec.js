// core
const debug = require('debug')('APP:CREDIT_SPEC');

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
let stripeMethod = require(__base + 'methods/stripe');

describe('CREDIT', function () {

  let shared = {
    enterprise: {},
    token: ''
  };

  before(async function() {
    shared.token = await stripeMethod.gateway.tokens.create({
      card: {
        "number": '4242424242424242',
        "exp_month": 12,
        "exp_year": 2017,
        "cvc": '123'
      }
    });

    await new Promise(function (resolve, reject) {
      request
        .post(`${commonHelper.getEnterpriseAPIUrl()}/cards`)
        .send({
          paymentToken: shared.token.id
        })
        .set('Authorization', global.data.companyAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          resolve();
        });
    });


  });

  describe('deposit', function () {
    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getEnterpriseAPIUrl()}/enterprises/self`)
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            shared.enterprise = res.body.result;
            resolve();
          });
      });

      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/deposit`)
          .send({
            amount: 100,
          })
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            resolve();
          });
      });

      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getEnterpriseAPIUrl()}/enterprises/self`)
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
             result: {
               balance: (parseInt(shared.enterprise.balance) + 100).toString()
             }
            });
            resolve();
          });
      });


      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getEnterpriseAPIUrl()}/cards`)
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            resolve();
          });
      });

    });
  });

});
