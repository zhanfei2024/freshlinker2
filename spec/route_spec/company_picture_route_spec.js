// core
const debug = require('debug')('APP:COMPANY_PICTURE_SPEC');

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


describe('COMPANY PICTURE', function () {
  let shared = {
    company: {},
    country: {},
  };

  //get country
  before(function () {
    shared.country = global.data.countries[0];
  });

  let sharedForListPicture = {
    picture: {},
    findPictureResult: {},
  };
  describe('List Picture', function () {

    // create a picture
    before(async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/pictures`)
          .field('name', 'company')
          .attach('file', __base + 'spec/sample_file/1200x1000.png')
          .set('Authorization', global.data.companyAuthToken)
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
          .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/pictures/${sharedForListPicture.picture.id}`)
          .set('Authorization', global.data.companyAuthToken)
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


    describe('by user:', function () {
      it('`url` field should be include', async function() {
        expect(sharedForListPicture.findPictureResult).to.include.keys('url');
      });
    });

    // describe('by public:', function () {
    //   it('get source image should work', async function() {
    //     await new Promise(function (resolve, reject) {
    //       request
    //         .get(sharedForListPicture.findPictureResult.url['1024'])
    //         .end(function (err, res) {
    //           expect(res.ok).to.be.true;
    //           resolve();
    //         });
    //     });
    //   });
    // });

  });

  describe('Create Picture', function () {

    describe('by user:', function () {

      it('icon should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/icon`)
            .field('name', 'abc')
            .attach('file', __base + 'spec/sample_file/500x500.png')
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

      it('with `name` field should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/pictures`)
            .field('name', 'abc')
            .attach('file', __base + 'spec/sample_file/1200x1000.png')
            .set('Authorization', global.data.companyAuthToken)
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
          .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/pictures`)
          .field('name', 'company')
          .attach('file', __base + 'spec/sample_file/1200x1000.png')
          .set('Authorization', global.data.companyAuthToken)
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
          .del(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/pictures/${sharedForDeletePicture.picture.id}`)
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

