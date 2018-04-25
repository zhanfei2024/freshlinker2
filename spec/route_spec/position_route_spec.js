// core
const debug = require('debug')('APP:POSITION_SPEC');

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
// library
const _ = require('lodash');


describe('POSITION', function () {

  let recoveryPositionLimitPromise = function (enterpriseId, positionQuota, date) {
    return models.Enterprise.update({
      positionQuota: positionQuota,
      planId: 1,
      planExpiredDate: moment(date)
    }, {
      where: {id: enterpriseId}
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

  before(async function() {
    await recoveryPositionLimitPromise(global.data.companyAuth.id, 10,'2020-12-10');
  });

  describe('List positions', function () {
    // setting position counts
    let sharedForListPosition = {
      position: {},
      inactivePosition: {}
    };

    // create active position
    before(async function() {
      let data = modelHelper.faker.position({
        active: true,
        companyId: global.data.company.id,
        locationId: global.data.locations[1].id,
        categoryIds: [global.data.positionCategories[1].id],
        educationLevelId: shared.educationLevel.id,
        skills: [{"name": "test5"}, {"name": "ertert"}, {"name": "234234"}],
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

            sharedForListPosition.position = res.body.result;
            resolve();
          });
      });
    });

    // create inactive position
    before(async function() {
      let data = modelHelper.faker.position({
        active: false,
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
            sharedForListPosition.inactivePosition = res.body.result;
            resolve();
          });
      });
    });

    describe('by user:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
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

      it('get one should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${sharedForListPosition.position.id}`)
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

    describe('by public:', function () {
      it('get all should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/positions`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });
      });

      it('get all should return `active` record only', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/positions`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [{
                  id: sharedForListPosition.position.id
                }]
              });
              resolve();
            });
        });
      });

      // TODO get all should return non-expired record only
      it('get all should return non-expired record only', async function() {
        let sharedForListPosition = {
          position: {},
        };
        let data = modelHelper.faker.position({
          active: false,
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
              sharedForListPosition.position = res.body.result;
              resolve();
            });
        });


        // admin update  position expired date
        let data1 = modelHelper.faker.position({
          expiredDate: "2016-06-06",
          email:'zhengfei@yoov.com'
        });
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getAdminAPIUrl()}/positions/${sharedForListPosition.position.id}`)
            .send(data1)
            .set('Authorization', global.data.adminAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              sharedForListPosition.validation = res.body.result[0];
              resolve();
            });
        });

        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/positions`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              expect(_.map(res.body.result, 'id')).to.not.include.members([sharedForListPosition.position.id]);
              resolve();
            });
        });
      });

      // TODO get one should return non-expired record only
      it('get all should return non-expired record only', async function() {
        let sharedForListPosition = {
          position: {},
        };
        let data = modelHelper.faker.position({
          active: false,
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
              sharedForListPosition.position = res.body.result;
              resolve();
            });
        });


        // admin update  position expired date
        let data1 = modelHelper.faker.position({
          expiredDate: "2016-06-06",
          email:'zhengfei@yoov.com'
        });
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getAdminAPIUrl()}/positions/${sharedForListPosition.position.id}`)
            .send(data1)
            .set('Authorization', global.data.adminAuthToken)
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
            .get(`${commonHelper.getPublicAPIUrl()}/positions/${sharedForListPosition.position.id}`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
              });
              expect(res.body.result).to.be.eql({});
              resolve();
            });
        });
      });


      it('get one should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/positions/${sharedForListPosition.position.id}`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });
      });

      it('get one should return `active` record only', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/positions/${sharedForListPosition.inactivePosition.id}`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              expect(res.body.result).to.be.eql({});
              resolve();
            });
        });
      });


      it('click traffic', async function() {
        let sharedForListPosition = {
          position: {},
        };
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
              sharedForListPosition.position = res.body.result;
              resolve();
            });
        });

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getPublicAPIUrl()}/positions/${sharedForListPosition.position.id}/click_traffic`)
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

  describe('Create position', function () {
    // ===================
    // BY ADMIN
    // ===================
    describe('by admin:', function () {
      it('should work', async function() {
        let data = modelHelper.faker.position({
          companyId: global.data.company.id,
          locationId: global.data.locations[1].id,
          categoryIds: [global.data.positionCategories[1].id],
          educationLevelId: shared.educationLevel.id,
          email:'zhengfei@yoov.com'
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getAdminAPIUrl()}/positions`)
            .send(data)
            .set('Authorization', global.data.adminAuthToken)
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

      describe('validation:', function () {

        it('VALIDATION: `categoryIds` should only be accept sub category', async function() {
          let data = modelHelper.faker.position({
            educationLevelId: shared.educationLevel.id,
            locationId: global.data.locations[1].id,
            categoryIds: [global.data.positionCategories[0].id],
            email:'zhengfei@yoov.com'
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
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

        it('VALIDATION: `locationId` should only be accept sub location', async function() {
          let data = modelHelper.faker.position({
            educationLevelId: shared.educationLevel.id,
            locationId: global.data.locations[0].id,
            categoryIds: [global.data.positionCategories[1].id],
            email:'zhengfei@yoov.com'
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
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

        it('VALIDATION: `salaryType` should be in `monthly,hourly,yearly`', async function() {
          let data = modelHelper.faker.position({
            educationLevelId: shared.educationLevel.id,
            locationId: global.data.locations[1].id,
            categoryIds: [global.data.positionCategories[1].id],
            salaryType: 'test',
            email:'zhengfei@yoov.com'
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
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

        it('VALIDATION: `experience` should be in `0, 0.5, 1, 2, 3, 4, 5, 5+`', async function() {
          let data = modelHelper.faker.position({
            educationLevelId: shared.educationLevel.id,
            locationId: global.data.locations[1].id,
            categoryIds: [global.data.positionCategories[1].id],
            experience: '7',
            email:'zhengfei@yoov.com'
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
              .send(data)
              .set('Authorization', global.data.companyAuthToken)
              .end(function (err, res) {
                expect(res.ok).to.be.false;
                expect(res.body).to.containSubset({
                  status: false,
                });
                // 预计返回 false
                resolve();
              });
          });
        });

        it('VALIDATION: `postedDate` should not allow to edit', async function() {
          let data = modelHelper.faker.position({
            educationLevelId: shared.educationLevel.id,
            locationId: global.data.locations[1].id,
            categoryIds: [global.data.positionCategories[1].id],
            postedDate: '2015-11-11',
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
                  status: true,
                });
                expect(res.body.postedDate).to.not.eql('2015-11-11');
                resolve();
              });
          });
        });

        it('VALIDATION: `educationLevelId` should exists', async function() {
          let data = modelHelper.faker.position({
            companyId: global.data.company.id,
            locationId: global.data.locations[1].id,
            categoryIds: [global.data.positionCategories[1].id],
            educationLevelId: 999,
            email:'zhengfei@yoov.com'
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
              .send(data)
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

        it('VALIDATION: `type` should be in `full-time,part-time,internship,freelance,others`', async function() {
          let data = modelHelper.faker.position({
            companyId: global.data.company.id,
            locationId: global.data.locations[1].id,
            categoryIds: [global.data.positionCategories[1].id],
            educationLevelId: shared.educationLevel.id,
            type: 'abc',
            email:'zhengfei@yoov.com'
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
              .send(data)
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

      describe('field:', function () {

      });
    });

    // ===================
    // BY USER
    // ===================
    describe('by user:', function () {
      it('should work', async function() {
        let data = modelHelper.faker.position({
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

      describe('validation:', function () {

        it('VALIDATION: should not allow if `positionLimit`', async function() {
          await recoveryPositionLimitPromise(global.data.companyAuth.id, 0);
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
                expect(res.ok).to.be.false;
                expect(res.body).to.containSubset({
                  status: false
                });
                resolve();
              });
          });
          await recoveryPositionLimitPromise(global.data.companyAuth.id, 10);
        });

        it('VALIDATION: `companyId` should not allow edit', async function() {
          let data = modelHelper.faker.position({
            educationLevelId: shared.educationLevel.id,
            locationId: global.data.locations[1].id,
            categoryIds: [global.data.positionCategories[1].id],
            companyId: 8,
            email:'zhengfei@yoov.com'
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
              .send(data)
              .set('Authorization', global.data.companyAuthToken)
              .end(function (err, res) {
                expect(res.body.companyId).to.not.eql(shared.position.companyId);
                resolve();
              });
          });
        });

        it('VALIDATION: `expiredDate` should not allow edit', async function() {
          let data = modelHelper.faker.position({
            educationLevelId: shared.educationLevel.id,
            locationId: global.data.locations[1].id,
            categoryIds: [global.data.positionCategories[1].id],
            companyId: global.data.company.id,
            expiredDate: '2015-11-11',
            email:'zhengfei@yoov.com'
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
              .send(data)
              .set('Authorization', global.data.companyAuthToken)
              .end(function (err, res) {
                expect(res.body.expiredDate).to.not.eql(data.expiredDate);
                resolve();
              });
          });
        });

        it('VALIDATION: `postedDate` should not allow edit', async function() {
          let data = modelHelper.faker.position({
            educationLevelId: shared.educationLevel.id,
            locationId: global.data.locations[1].id,
            categoryIds: [global.data.positionCategories[1].id],
            companyId: global.data.company.id,
            postedDate: '2015-11-11',
            email:'zhengfei@yoov.com'
          });
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
              .send(data)
              .set('Authorization', global.data.companyAuthToken)
              .end(function (err, res) {
                expect(res.body.postedDate).to.not.eql(data.postedDate);
                resolve();
              });
          });
        });
      });
      describe('field:', function () {
      });
    });

  });

  describe('Update position', function () {
    it('should work', async function() {
      let data = modelHelper.faker.position({
        companyId: global.data.company.id,
        locationId: global.data.locations[1].id,
        categoryIds: [global.data.positionCategories[1].id],
        educationLevelId: shared.educationLevel.id,
        email:'zhengfei@yoov.com'
      });
      await new Promise(function (resolve, reject) {
        request
          .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}`)
          .set('Authorization', global.data.companyAuthToken)
          .send(data)
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

  describe('Renew position', function () {
    it('should not allow renew if `positionLimit:positionQuota`', async function() {
      await recoveryPositionLimitPromise(global.data.companyAuth.id, 0);
      let data = modelHelper.faker.position({
        companyId: global.data.company.id,
        locationId: global.data.locations[1].id,
        categoryIds: [global.data.positionCategories[1].id],
        educationLevelId: shared.educationLevel.id,
        email:'zhengfei@yoov.com'
      });
      await new Promise(function (resolve, reject) {
        request
          .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/renew`)
          .set('Authorization', global.data.companyAuthToken)
          .send(data)
          .end(function (err, res) {
            expect(res.ok).to.be.false
            expect(res.body).to.containSubset({
              status: false
            });
            resolve();
          });
      });
    });

    /*
    it('should not allow renew if `positionLimit:planExpiredDate`',async function() {
      await recoveryPositionLimitPromise(global.data.companyAuth.id, 10,'2016-12-30');
      let data = modelHelper.faker.position({
        companyId: global.data.company.id,
        locationId: global.data.locations[1].id,
        categoryIds: [global.data.positionCategories[1].id],
        educationLevelId: shared.educationLevel.id,
        email:'zhengfei@yoov.com'
      });
      await new Promise(function (resolve, reject) {
        request
          .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/renew`)
          .set('Authorization', global.data.companyAuthToken)
          .send(data)
          .end(function (err, res) {
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              status: false
            });
            resolve();
          });
      });
    });
*/

    it('should work', async function() {
      await recoveryPositionLimitPromise(global.data.companyAuth.id, 10,'2019-12-10');
      let data = modelHelper.faker.position({
        companyId: global.data.company.id,
        locationId: global.data.locations[1].id,
        categoryIds: [global.data.positionCategories[1].id],
        educationLevelId: shared.educationLevel.id,
        email:'zhengfei@yoov.com'
      });
      await new Promise(function (resolve, reject) {
        request
          .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/renew`)
          .set('Authorization', global.data.companyAuthToken)
          .send(data)
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

  describe('Delete position', function () {

    let sharedForDeletePosition = {
      position: {}
    };
    // create active position
    beforeEach(async function() {
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
            sharedForDeletePosition.position = res.body.result;
            resolve();
          });
      });
    });

    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${sharedForDeletePosition.position.id}`)
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
