// core
const debug = require('debug')('APP:STATIC_IMAGE_SPEC');

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

describe('STATIC IMAGE', function () {
  describe('get image', function () {

  });

  describe('upload image', function () {
    describe('by enterprise:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getEnterpriseAPIUrl()}/upload_images`)
            .field('name', 'abc')
            .attach('file', __base + 'spec/sample_file/1200x1000.png')
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
    });

    describe('by user:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/upload_images`)
            .field('name', 'abc')
            .attach('file', __base + 'spec/sample_file/1200x1000.png')
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
              });
              resolve();
            });
        });
      });
    });
  });

});

