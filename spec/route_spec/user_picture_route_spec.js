// core
const debug = require('debug')('APP:USER_PICTURE_SPEC');

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


describe('USER PICTURE', function () {
  let clearUserPromise = function () {
    return models.User.destroy({
      where: {
        id: {
          $ne: 0
        }
      }
    });
  };

  let shared = {
    user: {},
    country: {}
  };

  //get country
  before(async function() {
    await new Promise(function (resolve, reject) {
      request
        .get(`${commonHelper.getPublicAPIUrl()}/countries`)
        .set('Authorization', global.data.userAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          expect(res.body).to.containSubset({
            status: true
          });
          shared.country = res.body.result[0];
          resolve();
        });
    });
  });

  // clear user
  //before(async function() {
  //  await clearUserPromise();
  //});

  // clear user
  //after(async function() {
  //  await clearUserPromise();
  //});

  describe('List Picture', function () {
    let sharedForListPicture = {
      picture: {},
      findPictureResult: {},
    };
    // create a picture
    before(async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/users/self/pictures`)
          .field('name', 'user')
          .attach('file', __base + 'spec/sample_file/1200x1000.png')
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForListPicture.picture = res.body.result;
            resolve();
          });
      });
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/users/self/pictures/${sharedForListPicture.picture.id}`)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForListPicture.findPictureResult = res.body.result;
            resolve();
          });
      });
    });

    describe('by public:', function () {
    });

    describe('by user:', function () {
      it('`url` field should be include', async function() {
        expect(sharedForListPicture.findPictureResult).to.include.keys('url');
      });

    });
  });

  describe('Create Picture', function () {
    describe('by user:', function () {
      it('with `name` field should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/pictures`)
            .field('name', 'abc')
            .attach('file', __base + 'spec/sample_file/1200x1000.png')
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  name: 'abc',
                }
              });
              resolve();
            });
        });
      });

    });
  });

  describe('Delete Picture', function () {
    let sharedForDeletePicture = {
      picture: {},
    };
    // create a picture
    before(async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/users/self/pictures`)
          .field('name', 'user')
          .attach('file', __base + 'spec/sample_file/1200x1000.png')
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForDeletePicture.picture = res.body.result;
            resolve();
          });
      });
    });

    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .del(`${commonHelper.getUserAPIUrl()}/users/self/pictures/${sharedForDeletePicture.picture.id}`)
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

