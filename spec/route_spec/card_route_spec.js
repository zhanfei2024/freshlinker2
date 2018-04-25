// core
const debug = require('debug')('APP:CARD_SPEC');

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

let createCardPromise = async function(cardIndex) {
  let cards = [
    {
      "number": '4242424242424242',
      "exp_month": 12,
      "exp_year": 2017,
      "cvc": '123'
    },
    {
      "number": '4012888888881881',
      "exp_month": 12,
      "exp_year": 2017,
      "cvc": '123'
    },
    {
      "number": '4000056655665556',
      "exp_month": 12,
      "exp_year": 2017,
      "cvc": '123'
    },
  ];

  let token = await stripeMethod.gateway.tokens.create({
    card: cards[(cardIndex - 1)]
  });

  return new Promise(function (resolve, reject) {
    request
      .post(`${commonHelper.getEnterpriseAPIUrl()}/cards`)
      .send({
        paymentToken: token.id
      })
      .set('Authorization', global.data.companyAuthToken)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      });
  });
};

describe('CARD', function (cardIndex) {

  let shared = {
    card: {},
    card2: {},
  };

  before(async function() {
    shared.card = await createCardPromise(1);
    shared.card2 = await createCardPromise(2);
  });

  describe('list cards', function () {
    it('get all should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getEnterpriseAPIUrl()}/cards`)
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
              result: [
                {id: shared.card.id}
              ]
            });
            resolve();
          });
      });
    });

    it('get one should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getEnterpriseAPIUrl()}/cards/${shared.card.id}`)
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

  describe('update post', function () {

    it('set default should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/cards/${shared.card.id}/default`)
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            resolve();
          });
      });

      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getEnterpriseAPIUrl()}/cards/${shared.card.id}`)
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
              result: {
                default_source: true
              }
            });
            resolve();
          });
      });
    });

  });


});
