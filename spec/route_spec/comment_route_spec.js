// core
const debug = require('debug')('APP:COMMENT_SPEC');

// model
const models = require(__base + 'models');

const _ = require('lodash');

// test lib
let request = require('superagent');
let chai = require('chai');
let chaiSubset = require('chai-subset');
let expect = chai.expect;
chai.use(chaiSubset);

let commonHelper = require('../helpers/common_helper');
let modelHelper = require('../helpers/model_helper');

function createPostPromise(data) {
  return new Promise(function (resolve, reject) {
    if (_.isUndefined(data)) data = modelHelper.faker.post();
    let url = `${commonHelper.getUserAPIUrl()}/posts`;
    let authorization = global.data.userAuthToken;
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

function createComment(type,shared,user,data) {
  return new Promise(function (resolve, reject) {
    if (_.isUndefined(data)) data = modelHelper.faker.comment();
    let url = type === 'post' ? `${commonHelper.getUserAPIUrl()}/posts/${shared.post.id}/comments` : `${commonHelper.getUserAPIUrl()}/comments/${shared.id}/replies`;
    let authorization = user;
    request
      .post(url)
      .send(data)
      .set('Authorization', authorization)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        expect(res.body).to.containSubset({
          status: true,
        });
        resolve(res.body.result);
      });
  });
}

describe('COMMENT', function () {

  // create active post
  let sharedPost = {
    post: {}
  };

  before(async function() {
    sharedPost.post = await createPostPromise();
    await updatePostByAdminPromise(sharedPost.post.id, {
      active: true,
      isApproved: true,
      tags: [{name: 'tag1'}, {name: 'tag2'}],
      categories: [global.data.postCategories[1].id]
    });
  });

  // create comment
  let sharedComments = {
    comment: {},
    comment2: {},
    comment3: {}
  };

  before(async function() {
    sharedComments.comment = await createComment('post',sharedPost,global.data.userAuthToken);
    sharedComments.comment2 = await createComment('post',sharedPost,global.data.user2AuthToken);
    sharedComments.comment3 = await createComment('post',sharedPost,global.data.user3AuthToken);
  });

  // create apply
  let sharedReplies = {
    reply: {},
    reply2: {},
    reply3: {},
    reply4: {},
    reply5: {},
    reply6: {},
    reply7: {},
    reply8: {},
    reply9: {},
    reply10: {}
  };

  before(async function() {
    sharedReplies.reply = await createComment('comment',sharedComments.comment,global.data.userAuthToken);
    sharedReplies.reply2 = await createComment('comment',sharedComments.comment,global.data.user2AuthToken);
    sharedReplies.reply3 = await createComment('comment',sharedComments.comment,global.data.user3AuthToken);
    sharedReplies.reply4 = await createComment('comment',sharedComments.comment2,global.data.userAuthToken);
    sharedReplies.reply5 = await createComment('comment',sharedComments.comment2,global.data.user2AuthToken);
    sharedReplies.reply6 = await createComment('comment',sharedComments.comment2,global.data.user3AuthToken);
    sharedReplies.reply7 = await createComment('comment',sharedComments.comment3,global.data.userAuthToken);
    sharedReplies.reply8 = await createComment('comment',sharedComments.comment3,global.data.user2AuthToken);
    sharedReplies.reply9 = await createComment('comment',sharedComments.comment2,global.data.user3AuthToken);
    sharedReplies.reply10 = await createComment('comment',sharedComments.comment3,global.data.user2AuthToken);
  });

  describe('comment list', function () {

    describe('by public:', function () {
      it('get all should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/comments`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedComments.comment.id},
                  {id: sharedComments.comment2.id},
                  {id: sharedComments.comment3.id},
                  {id: sharedReplies.reply.id},
                  {id: sharedReplies.reply2.id},
                  {id: sharedReplies.reply3.id},
                  {id: sharedReplies.reply4.id},
                  {id: sharedReplies.reply5.id},
                  {id: sharedReplies.reply6.id},
                  {id: sharedReplies.reply7.id},
                  {id: sharedReplies.reply8.id},
                  {id: sharedReplies.reply9.id}
                ]
              });
              resolve();
            });
        });
      });

      it('get all should work about any user', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/comments`)
            .set('userId', global.data.user2Auth.id)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedComments.comment2.id},
                  {id: sharedReplies.reply2.id},
                  {id: sharedReplies.reply5.id},
                  {id: sharedReplies.reply8.id}
                ]
              });
              resolve();
            });
        });
      });

      it('get all should work about any post', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/posts/${sharedPost.post.id}/comments`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedComments.comment.id},
                  {id: sharedComments.comment2.id},
                  {id: sharedComments.comment3.id}
                ]
              });
              resolve();
            });
        });
      });

      it('get all replies should work about any comment', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/comments/${sharedComments.comment.id}/replies`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedReplies.reply.id},
                  {id: sharedReplies.reply2.id},
                  {id: sharedReplies.reply3.id}
                ]
              });
              resolve();
            });
        });
      });

    });

    describe('by user:', function () {
      it('get all should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/comments`)
            .set('Authorization', global.data.user2AuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedComments.comment2.id},
                  {id: sharedReplies.reply2.id},
                  {id: sharedReplies.reply5.id},
                  {id: sharedReplies.reply8.id}
                ]
              });
              resolve();
            });
        });
      });

      it('get all should work about any post', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/posts/${sharedPost.post.id}/comments`)
            .set('Authorization', global.data.user2AuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedComments.comment2.id},
                ]
              });
              resolve();
            });
        });
      });

      it('get all replies should work about any comment', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/comments/${sharedComments.comment.id}/replies`)
            .set('Authorization', global.data.user2AuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedReplies.reply2.id}
                ]
              });
              resolve();
            });
        });
      });

    });

  });

  describe('comment like', function () {
    it('should not work when it likes itself ', async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/comments/${sharedComments.comment.id}/like`)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              status: false,
              "message": "comment can not allow to edit"
            });
            resolve();
          });
      });
    });

    it('should work when it likes some else ', async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/comments/${sharedComments.comment.id}/like`)
          .set('Authorization', global.data.user2AuthToken)
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

  describe('comment dislike', function () {

    it('should work when it doubted the second time', async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/comments/${sharedComments.comment.id}/like`)
          .set('Authorization', global.data.user2AuthToken)
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

  describe('create comment', function () {

    it('should work to reply to any of the answers', async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/comments/${sharedComments.comment.id}/replies`)
          .send(modelHelper.faker.comment())
          .set('Authorization', global.data.user2AuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
              result:{
                userId: global.data.user2Auth.id
              }
            });
            resolve();
          });
      });

    });

    it('should work to delete any comments the user`s own', async function() {

      await new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getUserAPIUrl()}/comments/${sharedReplies.reply10.id}`)
          .set('Authorization', global.data.user2AuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            resolve();
          });
      });

    });

    it('should not work to delete any comments others` own', async function() {

      await new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getUserAPIUrl()}/comments/${sharedReplies.reply9.id}`)
          .set('Authorization', global.data.user2AuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              status: false,
              "message": "Not found"
            });
            resolve();
          });
      });

    });

    it('should not work to reply to any of the reply ', async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/comments/${sharedReplies.reply.id}/replies`)
          .send(modelHelper.faker.comment())
          .set('Authorization', global.data.user3AuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              status: false,
              "message": "comment can not allow to edit"
            });
            resolve();
          });
      });
    });

  });

});
