// core
const debug = require('debug')('APP:BOOKMARK_SPEC');

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

describe('BOOKMARK', function () {

  let settingRolePromise = function () {
    return models.Plan.update({
      meta: [{"price": 0, "expiredDate": 30, "positionNum": 100}]
    }, {
      where: {name: 'lite'}
    });
  };

  // setting position counts
  before(async function() {
    await settingRolePromise();
  });

  let bookmarkPromise = function (positionId) {
    return new Promise(function (resolve, reject) {
      request
        .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/bookmark`)
        .send({
          positionId: positionId
        })
        .set('Authorization', global.data.userAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          expect(res.body).to.containSubset({
            status: true
          });
          resolve();
        });
    });
  };

  let shared = {
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
      educationLevelId: global.data.educationLevels[0].id,
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

  // create inactive position
  before(async function() {
    let data = modelHelper.faker.position({
      active: false,
      companyId: global.data.company.id,
      locationId: global.data.locations[1].id,
      categoryIds: [global.data.positionCategories[1].id],
      educationLevelId: global.data.educationLevels[0].id,
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
          shared.inactivePosition = res.body.result;
          resolve();
        });
    });
  });

  describe('List Bookmark', function () {

    before(async function() {
      await bookmarkPromise(shared.position.id);
    });

    describe('by user:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/bookmarks`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {
                    positionId: shared.position.id
                  }
                ]
              });
              resolve();
            });
        });
      });

    });
  });

  describe('Delete bookmark', function () {
    beforeEach(async function() {
      await bookmarkPromise(shared.position.id);
    });
    describe('by user:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .del(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/bookmark`)
            .set('Authorization', global.data.userAuthToken)
            .send({
              positionId: shared.position.id
            })
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

