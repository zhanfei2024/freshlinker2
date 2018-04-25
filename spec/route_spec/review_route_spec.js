// core
const debug = require('debug')('APP:REVIEW_SPEC');

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

function createPosition(data) {
  if(_.isUndefined(data)) data = modelHelper.faker.position({active:true,educationLevelId:3,email:'123@123.com',categoryIds:[global.data.positionCategories[1].id]});
  return new Promise(function (resolve, reject) {
    request
      .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
      .send(data)
      .set('Authorization',global.data.companyAuthToken)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      })
  });

}

function applyPosition(positionId,token){
  return new Promise(function (resolve, reject) {
    request
      .post(`${commonHelper.getUserAPIUrl()}/positions/${positionId}/apply`)
      .set('Authorization',token)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve(res.body.result)
      })
  })
}

function updateCandidate(candidateId,id) {
  return new Promise(function (resolve, reject) {
    request
      .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/candidates/${candidateId}`)
      .set('Authorization',global.data.companyAuthToken)
      .send({candidateStatusId:id})
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve();
      })
  })
}

function createReview (data){
  if(_.isUndefined(data)) data = modelHelper.faker.comment();
  return new Promise(function (resolve, reject) {
    request
      .post(`${commonHelper.getUserAPIUrl()}/reviews`)
      .set('Authorization',global.data.userAuthToken)
      .send(data)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve(res.body.result)
      })

  });
}

let position,candidate;

describe('REVIEW',function () {

  before(async function () {
    position = await createPosition();
    candidate = await applyPosition(position.id,global.data.userAuthToken);
  });
  describe('review list',function () {

    let shareReviews = {
      review:{},
      review2:{},
      review3:{}
    };

    before(async function () {
      await updateCandidate(candidate.id,3);
      shareReviews.review = await createReview();
      shareReviews.review2 = await createReview();
      shareReviews.review3 = await createReview();
    });

    describe('by public',function () {

      it('should work get all',async function () {
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getPublicAPIUrl()}/reviews`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result:[
                  {id:shareReviews.review.id},
                  {id:shareReviews.review2.id},
                  {id:shareReviews.review3.id},
                ]
              });
              resolve();
            })
        });
      });

      it('should work get one',async function () {
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getPublicAPIUrl()}/reviews/${shareReviews.review.id}`)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result: {id:shareReviews.review.id}
              });
              resolve();
            })
        });
      });

    });

    describe('by user',function () {

      it('should work get all',async function () {
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getUserAPIUrl()}/reviews`)
            .set('Authorization',global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result:[
                  {id:shareReviews.review.id},
                  {id:shareReviews.review2.id},
                  {id:shareReviews.review3.id},
                ]
              });
              resolve();
            })
        });
      });

      it('should work get one',async function () {
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getUserAPIUrl()}/reviews/${shareReviews.review.id}`)
            .set('Authorization',global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result: {id:shareReviews.review.id}
              });
              resolve();
            })
        });
      });

    });

    describe('by company',function () {

      it('should work get all',async function () {
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/reviews`)
            .set('Authorization',global.data.companyAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result:[
                  {id:shareReviews.review.id},
                  {id:shareReviews.review2.id},
                  {id:shareReviews.review3.id},
                ]
              });
              resolve();
            })
        });
      });

      it('should work get one',async function () {
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/reviews/${shareReviews.review.id}`)
            .set('Authorization',global.data.companyAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result: {id:shareReviews.review.id}
              });
              resolve();
            })
        });
      });

    });

  });

  describe('create review',function () {

    it('should not work',async function () {
      let data = modelHelper.faker.comment();
      return new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/reviews`)
          .set('Authorization',global.data.user2AuthToken)
          .send(data)
          .end(function (err, res) {
            expect(res.ok).to.be.false;
            resolve();
          });
      });
    });

    it('should not work isInterviewed ===  false',async function () {
      let data = modelHelper.faker.comment();
      await applyPosition(position.id,global.data.user2AuthToken);
      return new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/reviews`)
          .set('Authorization',global.data.user2AuthToken)
          .send(data)
          .end(function (err, res) {
            expect(res.ok).to.be.false;
            resolve();
          });
      });
    });

  });

  describe('delete review',function () {

    it('should work',async function () {
      await updateCandidate(candidate.id,4);
      let review = await createReview();
      return new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getUserAPIUrl()}/reviews/${review.id}`)
          .set('Authorization',global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            resolve();
          })
      });

    });

  });

});

