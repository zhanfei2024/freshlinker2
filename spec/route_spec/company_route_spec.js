// core
const debug = require('debug')('APP:COMPANY_SPEC');

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

describe('COMPANY', function () {
  let shared = {
    company: {},
    country: {}
  };

  //get country
  before(function () {
    shared.country = global.data.countries[0];
  });

  describe('List Company', function () {
    describe('by public:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/companies`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });

              resolve();
            });
        });
      });

      it('should list approved company only', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/companies`)
            .end(function (err, res) {
              expect(res.body.result.length).to.eql(2);
              resolve();
            });
        });
      });

      it('`icon` field should be include', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/companies/${global.data.company.id}`)
            .end(function (err, res) {
              expect(res.body.result).to.include.keys('icon');
              resolve();
            });
        });
      });
    });

    describe('by user:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}`)
            .set('Authorization', global.data.companyAuthToken)
            .end(function (err, res) {
              debug(global.data.company.id)
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });
      });

      it('should access self companies only', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company2.id}`)
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
    });

  });

  describe('Create company', function () {
    describe('by admin:', function () {
      describe('validation:', function () {
        it('`enterpriseId` should required', async function() {
          let data = modelHelper.faker.company({
            countryId: shared.country.id,
          });
          delete data.enterpriseId;
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getAdminAPIUrl()}/companies`)
              .send(data)
              .set('Authorization', global.data.adminAuthToken)
              .end(function (err, res) {
                debug(res.body);
                expect(res.ok).to.be.false;
                expect(res.body).to.containSubset({
                  status: false
                });
                resolve();
              });
          });
        });

        it('`enterpriseId` should exists', async function() {
          let data = modelHelper.faker.company({
            countryId: shared.country.id,
            enterpriseId: 9999,
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getAdminAPIUrl()}/companies`)
              .send(data)
              .set('Authorization', global.data.adminAuthToken)
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

      describe('field:', function () {
        let sharedForCreateCompany = {
          company: {},
          updateDate: {}
        };

        before(async function() {
          sharedForCreateCompany.updateData = modelHelper.faker.company({
            countryId: shared.country.id,
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getAdminAPIUrl()}/companies`)
              .set('Authorization', global.data.adminAuthToken)
              .send(sharedForCreateCompany.updateData)
              .end(function (err, res) {
                sharedForCreateCompany.company = res.body.result;
                resolve();
              });
          });
        });

        it('`name` should work', function () {
          expect(sharedForCreateCompany.company.name).eql(sharedForCreateCompany.updateData.name);
        });
        it('`url` should work', function () {
          expect(sharedForCreateCompany.company.url).eql(sharedForCreateCompany.updateData.url);
        });
        it('`background` should work', function () {
          expect(sharedForCreateCompany.company.background).eql(sharedForCreateCompany.updateData.background);
        });
        it('`address` should work', function () {
          expect(sharedForCreateCompany.company.address).eql(sharedForCreateCompany.updateData.address);
        });
        it('`description` should work', function () {
          expect(sharedForCreateCompany.company.description).eql(sharedForCreateCompany.updateData.description);
        });
      });
    });

    describe('by enterprise:', function () {
      it('should work', async function() {
        let data = modelHelper.faker.company({
          countryId: shared.country.id
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getEnterpriseAPIUrl()}/companies`)
            .send(data)
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

      it('should allow to create more than one', async function() {
        let data = modelHelper.faker.company({
          countryId: shared.country.id
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getEnterpriseAPIUrl()}/companies`)
            .send(data)
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
            .post(`${commonHelper.getEnterpriseAPIUrl()}/companies`)
            .send(data)
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

      it('`isApproved` default should be `false`', async function() {
        let data = modelHelper.faker.company({
          countryId: shared.country.id,
          isApproved: true,
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getEnterpriseAPIUrl()}/companies`)
            .send(data)
            .set('Authorization', global.data.companyAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  isApproved: false
                }
              });
              resolve();
            });
        });
      });

    });
  });

  describe('Update company', function () {
    describe('by admin:', function () {
      describe('update field:', function () {
        let sharedForUpdateCompany = {
          company: {}
        };

        let data = modelHelper.faker.company({
          countryId: shared.country.id
        });
        delete data.enterpriseId;
        before(async function() {
          await new Promise(function (resolve, reject) {
            request
              .put(`${commonHelper.getAdminAPIUrl()}/companies/${global.data.company.id}`)
              .set('Authorization', global.data.adminAuthToken)
              .send(data)
              .end(function (err, res) {
                sharedForUpdateCompany.company = res.body.result;
                resolve();
              });
          });
        });

        it('`name` should work', function () {
          expect(sharedForUpdateCompany.company.name).eql(data.name);
        });
        it('`url` should work', function () {
          expect(sharedForUpdateCompany.company.url).eql(data.url);
        });
        it('`background` should work', function () {
          expect(sharedForUpdateCompany.company.background).eql(data.background);
        });
        it('`address` should work', function () {
          expect(sharedForUpdateCompany.company.address).eql(data.address);
        });
        it('`description` should work', function () {
          expect(sharedForUpdateCompany.company.description).eql(data.description);
        });
      });
    });

    describe('by user:', function () {
      it('should update self companies only', async function() {
        let data = {name: '555'};

        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getUserAPIUrl()}/companies/${global.data.company.id}`)
            .set('Authorization', global.data.company2AuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.false;
              resolve();
            });
        });
      });

      it('should not allow to change `isApproved`', async function() {
        let data = {isApproved: true};

        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.inactiveCompany.id}`)
            .set('Authorization', global.data.inactiveCompanyAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  isApproved: false
                }
              });
              resolve();
            });
        });
      });


      it('should not allow to change `enterpriseId`', async function() {
        let data = {enterpriseId: 5};

        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}`)
            .set('Authorization', global.data.companyAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  enterpriseId: global.data.companyAuth.id
                }
              });
              resolve();
            });
        });
      });

    });
  });

  describe('Delete company', function () {
    let sharedForDeleteCompany = {
      company: {}
    };
    // create company
    beforeEach(async function() {
      let data = modelHelper.faker.company({
        countryId: shared.country.id,
      });
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/companies`)
          .send(data)
          .set('Authorization', global.data.companyAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForDeleteCompany.company = res.body.result;
            resolve();
          });
      });
    });

    describe('by admin:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .del(`${commonHelper.getAdminAPIUrl()}/companies/${sharedForDeleteCompany.company.id}`)
            .end(function (err, res) {
              debug(res.body)
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

  describe('Click traffic for company', function () {
    describe('by public:', function () {
      let sharedForClickTrafficCompany={
        company1:{},
        company2:{},
      };

      beforeEach(async function() {
        let data = modelHelper.faker.company({
          countryId: shared.country.id,
          isApproved: true,
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getAdminAPIUrl()}/companies`)
            .set('Authorization', global.data.adminAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              sharedForClickTrafficCompany.company1 = res.body.result;
              resolve();
            });
        });
        let data1 = modelHelper.faker.company({
          countryId: shared.country.id,
          isApproved: false,
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getAdminAPIUrl()}/companies`)
            .set('Authorization', global.data.adminAuthToken)
            .send(data1)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              sharedForClickTrafficCompany.company2 = res.body.result;
              resolve();
            });
          });
      });

      it('When "isApproved is true " click traffic return true', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getPublicAPIUrl()}/companies/${sharedForClickTrafficCompany.company1.id}/click_traffic`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });
      });

      it('When "isApproved is false " click traffic return false', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getPublicAPIUrl()}/companies/${sharedForClickTrafficCompany.company2.id}/click_traffic`)
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

