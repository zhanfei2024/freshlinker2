// core
const debug = require('debug')('APP:POST_CATEGORY_SPEC');

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

describe('POST CATEGORY', function () {

  let createCategoryPromise = function (data) {
    return new Promise(function (resolve, reject) {
      request
        .post(`${commonHelper.getAdminAPIUrl()}/post_categories`)
        .send(data)
        .set('Authorization', global.data.adminAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          expect(res.body).to.containSubset({
            status: true
          });
          resolve(res.body.result);
        });
    });
  };
  let shared = {
    postCategory: {}
  };

  beforeEach(async function() {
    let data = modelHelper.faker.postCategory();
    delete data.parentId;
    shared.postCategory = await createCategoryPromise(data);
  });

  describe('List post category', function () {
    it('get all should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getPublicAPIUrl()}/post_categories`)
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
          .get(`${commonHelper.getPublicAPIUrl()}/post_categories/${shared.postCategory.id}`)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            resolve();
          });
      });
    });

    it('get tree type should work', async function() {
      let data = modelHelper.faker.postCategory();
      data.parentId = shared.postCategory.id;
      let childrenCategory = await createCategoryPromise(data);

      let data2 = modelHelper.faker.postCategory();
      data2.parentId = childrenCategory.id;
      let children2Category = await createCategoryPromise(data2);
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getPublicAPIUrl()}/post_categories/tree`)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
              result: [
                {
                  id: data.parentId,
                  children: [
                    {
                      id: childrenCategory.id,
                      children: [
                        {
                          id: children2Category.id
                        }
                      ]
                    }
                  ]
                }
              ]
            });
            resolve();
          });
      });
    });

  });

  describe('Create post category', function () {
    it('should work', async function() {
      let data = modelHelper.faker.postCategory();
      delete data.parentId;
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getAdminAPIUrl()}/post_categories`)
          .send(data)
          .set('Authorization', global.data.adminAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            resolve();
          });
      });
    });

    it('`depth` should be ignore', async function() {
      let data = modelHelper.faker.postCategory();
      delete data.parentId;
      data.depth = 5;
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getAdminAPIUrl()}/post_categories`)
          .send(data)
          .set('Authorization', global.data.adminAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            expect(res.body.result.depth).to.not.eql(5);
            resolve();
          });
      });
    });

  });

  describe('Update post category', function () {
    let sharedForUpdatePosition = {
      category: {}
    };
    before(async function() {
      let data = {
        name: 'abc',
        description: '123',
        parentId: '',
        order: 2,
        depth: 3
      };
      await new Promise(function (resolve, reject) {
        request
          .put(`${commonHelper.getAdminAPIUrl()}/post_categories/${shared.postCategory.id}`)
          .set('Authorization', global.data.adminAuthToken)
          .send(data)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
            });
            sharedForUpdatePosition.category = res.body.result;
            resolve();
          });
      });
    });
    it('update `name` should work', async function() {
      expect(sharedForUpdatePosition.category.name).to.eql('abc');
    });
    it('update `description` should work', async function() {
      expect(sharedForUpdatePosition.category.description).to.eql('123');
    });
    it('update `parentId` should work', async function() {
      expect(sharedForUpdatePosition.category.parentId).to.eql(null);
    });
    it('update `order` should work', async function() {
      expect(sharedForUpdatePosition.category.order).to.eql(2);
    });
    it('update `depth` should not work', async function() {
      expect(sharedForUpdatePosition.category.depth).to.eql(shared.postCategory.depth);
    });
  });

  describe('Delete post category', function () {
    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getAdminAPIUrl()}/post_categories/${shared.postCategory.id}`)
          .set('Authorization', global.data.adminAuthToken)
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
