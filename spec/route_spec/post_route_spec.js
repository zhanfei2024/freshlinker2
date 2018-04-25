// core
const debug = require('debug')('APP:POST_SPEC');

// model
const models = require(__base + 'models');

const _ = require('lodash');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');

function updatePostByAdminPromise(postId, data) {
  return new Promise(function (resolve, reject) {
    request
      .put(`${commonHelper.getAdminAPIUrl()}/posts/${postId}`)
      .send(data)
      .set('Authorization', global.data.adminAuth)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      });
  });
}

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
describe('POST', function () {

  describe('list posts', function () {

    let sharedForListPost = {
      post: {},
      post2: {},
      post3: {}
    };

    // create active post
    before(async function() {
      sharedForListPost.post = await createPostPromise('user');
      await updatePostByAdminPromise(sharedForListPost.post.id, {
        active: true,
        isApproved: true,
        tags: [{name: 'tag1'}, {name: 'tag2'}],
        categories: [global.data.postCategories[1].id]
      });
    });
    before(async function() {
      sharedForListPost.post2 = await createPostPromise('company');
      await updatePostByAdminPromise(sharedForListPost.post2.id, {
        active: true,
        isApproved: true,
        tags: [{name: 'tag2'}, {name: 'tag3'}],
        categories: [global.data.postCategories[1].id]
      });
    });
    before(async function() {
      sharedForListPost.post3 = await createPostPromise('company');
      await updatePostByAdminPromise(sharedForListPost.post2.id, {
        active: true,
        isApproved: true,
        tags: [{name: 'tag4'}, {name: 'tag5'}],
        categories: [global.data.postCategories[3].id]
      });
    });

    describe('by public:', function () {
      it('get all should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/posts`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedForListPost.post.id},
                  {id: sharedForListPost.post2.id}
                ]
              });
              resolve();
            });
        });
      });

      it('search should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/posts`)
            .query({
              search: 'tag2'
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;

              expect(res.body).to.not.containSubset({
                status: true,
                result: [
                  {id: sharedForListPost.post3.id},
                ]
              });
              resolve();
            });
        });
      });

      it('search by category work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/posts`)
            .query({
              categories: [global.data.postCategories[1].id]
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.not.containSubset({
                status: true,
                result: [
                  {id: sharedForListPost.post3.id},
                ]
              });
              resolve();
            });
        });
      });

      it('search by category work with limit', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/posts`)
            .query({
              limit: 1,
              categories: [global.data.postCategories[1].id]
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body.result[0].id).eql(sharedForListPost.post2.id);
              resolve();
            });
        });
      });

    });
    describe('by user:', function () {
      it('get all should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/posts`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedForListPost.post.id}
                ]
              });
              expect(res.body).to.not.containSubset({
                result: [
                  {id: sharedForListPost.post2.id}
                ]
              });
              resolve();
            });
        });
      });

      it('get one should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/posts/${sharedForListPost.post.id}`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {id: sharedForListPost.post.id}
              });
              resolve();
            });
        });
      });

    });

    //
    //it('should include `tags`', async function() {
    //  await new Promise(function (resolve, reject) {
    //    request
    //      .get(`${commonHelper.getUserAPIUrl()}/posts`)
    //      .set('Authorization', global.data.userAuthToken)
    //      .end(function (err, res) {
    //        expect(res.ok).to.be.true;
    //        expect(res.body.result).to.have.property('skills');
    //        resolve();
    //      });
    //  });
    //});
  });

  describe('update post', function () {

    let sharedForUpdatePost = {
      post: {},
    };

    describe('by admin:', function () {
      describe('validation:', function () {

      });
      describe('field:', function () {
        // create active post
        before(async function() {
          sharedForUpdatePost.post = await createPostPromise('user');
        });

        let data = modelHelper.faker.post();
        let sharedForUpdateUser = {
          post: []
        };
        before(async function() {
          data.tags = [
            {
              name: '普通话'
            },
            {
              name: '潮汕话'
            },
            {
              name: '客家话'
            }];
          await new Promise(function (resolve, reject) {
            request
              .put(`${commonHelper.getAdminAPIUrl()}/posts/${sharedForUpdatePost.post.id}`)
              .set('Authorization', global.data.adminAuthToken)
              .send(data)
              .end(function (err, res) {
                expect(res.ok).to.be.true;
                sharedForUpdateUser.post = res.body.result;
                resolve();
              });
          });
        });
        it('update `active` should work', function () {
          expect(sharedForUpdateUser.post.active).eql(data.active);
        });
        it('update `isApproved` should work', function () {
          expect(sharedForUpdateUser.post.isApproved).eql(data.isApproved);
        });
        it('update `title` should work', function () {
          expect(sharedForUpdateUser.post.title).eql(data.title);
        });
        it('update `content` should work', function () {
          expect(sharedForUpdateUser.post.content).eql(data.content);
        });
        it('update `tags` should work', function () {
          expect(sharedForUpdateUser.post.tags).to.containSubset([
            {
              name: '普通话'
            },
            {
              name: '潮汕话'
            },
            {
              name: '客家话'
            }
          ]);
        });
      });
    });
    describe('by public:', function () {
      // create active post
      before(async function() {
        sharedForUpdatePost.post = await createPostPromise('user');
      });

      it('click traffic should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getPublicAPIUrl()}/posts/${sharedForUpdatePost.post.id}/click_traffic`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              resolve();
            });
        });
      });

    });
    describe('by user:', function () {

      // create active post
      before(async function() {
        sharedForUpdatePost.post = await createPostPromise('user');
      });

      it('should not allow to edit `isApproved`', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getUserAPIUrl()}/posts/${sharedForUpdatePost.post.id}`)
            .set('Authorization', global.data.userAuthToken)
            .send({
              isApproved: !sharedForUpdatePost.post.isApproved
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body.result.isApproved).eql(sharedForUpdatePost.post.isApproved);
              resolve();
            });
        });
      });

      it('should not allow to edit `isFeatured`', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getUserAPIUrl()}/posts/${sharedForUpdatePost.post.id}`)
            .set('Authorization', global.data.userAuthToken)
            .send({
              isFeatured: !sharedForUpdatePost.post.isFeatured
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body.result.isFeatured).eql(sharedForUpdatePost.post.isFeatured);
              resolve();
            });
        });
      });

      it('`isApproved` should be `false` after updated', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getUserAPIUrl()}/posts/${sharedForUpdatePost.post.id}`)
            .set('Authorization', global.data.userAuthToken)
            .send({
              title: 'abc'
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body.result.isApproved).eql(false);
              resolve();
            });
        });
      });

    });


    describe('by company:', function () {

      // create active post
      before(async function() {
        sharedForUpdatePost.post = await createPostPromise('company');
      });

      it('should not allow to edit `isApproved`', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/posts/${sharedForUpdatePost.post.id}`)
            .set('Authorization', global.data.companyAuthToken)
            .send({
              isApproved: !sharedForUpdatePost.post.isApproved
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body.result.isApproved).eql(sharedForUpdatePost.post.isApproved);
              resolve();
            });
        });
      });

      it('should not allow to edit `isFeatured`', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/posts/${sharedForUpdatePost.post.id}`)
            .set('Authorization', global.data.companyAuthToken)
            .send({
              isFeatured: !sharedForUpdatePost.post.isFeatured
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body.result.isFeatured).eql(sharedForUpdatePost.post.isFeatured);
              resolve();
            });
        });
      });

      it('`isApproved` should be `false` after updated', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/posts/${sharedForUpdatePost.post.id}`)
            .set('Authorization', global.data.companyAuthToken)
            .send({
              title: 'abc'
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body.result.isApproved).eql(false);
              resolve();
            });
        });
      });

    });

  });

});
