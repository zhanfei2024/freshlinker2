// core
const debug = require('debug')('APP:POST_IMAGE_SPEC');

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

function createPostPromise(type, data) {
  return new Promise(function (resolve, reject) {
    if (_.isUndefined(data)) data = modelHelper.faker.post();
    let url = type === 'company' ? `${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/posts` : `${commonHelper.getUserAPIUrl()}/posts`;
    let authorization = type === 'company' ? global.data.companyAuthToken : global.data.userAuthToken;
    request
      .post(url)
      .send(data)
      .set('Authorization', authorization)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      });
  });
}

function createCoverPromiseTrue(type, postId, name) {
  let url = type === 'company' ? `${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/posts/${postId}/cover` : `${commonHelper.getUserAPIUrl()}/posts/${postId}/cover`;
  let authorization = type === 'company' ? global.data.companyAuthToken : global.data.userAuthToken;
  return new Promise(function (resolve, reject) {
    request
      .post(url)
      .attach('file', __base + 'spec/sample_file/1024x1024.png')
      .field('name', name || 'abc')
      .set('Authorization', authorization)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      });
  });
}
function createCoverPromiseFalse(type, postId, name) {
  let url = type === 'company' ? `${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/posts/${postId}/cover` : `${commonHelper.getUserAPIUrl()}/posts/${postId}/cover`;
  let authorization = type === 'company' ? global.data.companyAuthToken : global.data.userAuthToken;
  return new Promise(function (resolve, reject) {
    request
      .post(url)
      .attach('file', __base + 'spec/sample_file/1200x1000.png')
      .field('name', name || 'abc')
      .set('Authorization', authorization)
      .end(function (err, res) {
        expect(res.ok).to.be.false;
        resolve(res.body.result);
      });
  });
}
let sharedForListImage = {
  post: {},
  image: {},
};
describe('POST IMAGE', function () {
  describe('List Image', function () {

    // create a picture
    before(async function() {
      sharedForListImage.post = await createPostPromise('company');
      sharedForListImage.image = await createCoverPromiseTrue('company', sharedForListImage.post.id);
    });

    // describe('by public:', function () {
    //   it('`url` field should be include', function () {
    //     expect(sharedForListImage.image).to.include.keys('url');
    //   });
    //   it('get source image should work', async function() {
    //     await new Promise(function (resolve, reject) {
    //       request
    //         .get(sharedForListImage.image.url['1024'])
    //         .end(function (err, res) {
    //           expect(res.ok).to.be.true;
    //           resolve();
    //         });
    //     });
    //   });
    // });
  });

  describe('Create Image', function () {
    let sharedForCreateImage = {
      post: {},
    };

    describe('by company:', function () {
      before(async function() {
        sharedForCreateImage.post = await createPostPromise('company');
      });

      it('upload cover should work', async function() {
        await createCoverPromiseTrue('company', sharedForCreateImage.post.id);
        await createCoverPromiseFalse('company', sharedForCreateImage.post.id);
      });

      it('with `name` field should work', async function() {
        let result = await createCoverPromiseTrue('company', sharedForCreateImage.post.id, 'ggg');
        expect(result).to.containSubset({
          name: 'ggg'
        });
      });
    });

    describe('by user:', function () {
      before(async function() {
        sharedForCreateImage.post = await createPostPromise('user');
      });

      it('upload cover should work', async function() {
        await createCoverPromiseTrue('user', sharedForCreateImage.post.id);
        await createCoverPromiseFalse('user', sharedForCreateImage.post.id);
      });

      it('with `name` field should work', async function() {
        let result = await createCoverPromiseTrue('user', sharedForCreateImage.post.id, 'ggg');
        expect(result).to.containSubset({
          name: 'ggg'
        });
      });
    });

  });

  describe('Delete Image', function () {
    let sharedForDeleteImage = {
      post: {},
      image: {},
    };

    describe('by company:', function () {
      // create active post
      before(async function() {
        sharedForDeleteImage.post = await createPostPromise('company');
        sharedForDeleteImage.image = await createCoverPromiseTrue('company', sharedForDeleteImage.post.id);
      });

      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .del(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/posts/${sharedForDeleteImage.post.id}/images/${sharedForDeleteImage.image.id}`)
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

    describe('by user:', function () {
      // create active post
      before(async function() {
        sharedForDeleteImage.post = await createPostPromise('user');
        sharedForDeleteImage.image = await createCoverPromiseTrue('user', sharedForDeleteImage.post.id);
      });

      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .del(`${commonHelper.getUserAPIUrl()}/posts/${sharedForDeleteImage.post.id}/images/${sharedForDeleteImage.image.id}`)
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
});

