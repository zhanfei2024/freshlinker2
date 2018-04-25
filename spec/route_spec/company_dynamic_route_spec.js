// core
const debug = require('debug')('APP:COMPANIES_DYNAMIC_SPEC');

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

function createCompanyDynamic(data){
  return new Promise(function(resolve,reject){
    if (_.isUndefined(data)) data = modelHelper.faker.comment();
    request
      .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/companyDynamics`)
      .send(data)
      .set('Authorization',global.data.companyAuthToken)
      .end(function(err,res){
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      });
  });
}

describe('COMPANIES_DYNAMIC',function(){
  describe('list companyDynamic',function(){

    let sharedCompanyDynamics = {
      companyDynamic:{},
      companyDynamic2:{},
      companyDynamic3:{},
    };

    before(async function(){
      await models.Enterprise.update({planId:1},{where:{id:1}});
      sharedCompanyDynamics.companyDynamic = await createCompanyDynamic();
      sharedCompanyDynamics.companyDynamic2 = await createCompanyDynamic();
      sharedCompanyDynamics.companyDynamic3 = await createCompanyDynamic();
    });

    describe('by public',function(){
      it('get all should work',async function(){
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getPublicAPIUrl()}/companyDynamics`)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result:[
                  {id:sharedCompanyDynamics.companyDynamic.id},
                  {id:sharedCompanyDynamics.companyDynamic2.id},
                  {id:sharedCompanyDynamics.companyDynamic3.id},
                ]
              });
              resolve();
            });
        });
      });

      it('get one should work',async function(){
        await new Promise(function (resolve,reject) {
          request
            .get(`${commonHelper.getPublicAPIUrl()}/companyDynamics/${sharedCompanyDynamics.companyDynamic.id}`)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {id:sharedCompanyDynamics.companyDynamic.id}
              });
              resolve();
            });
        });
      });

    });

    describe('by company',function(){
      it('get all should work',async function(){
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/companyDynamics`)
            .set('Authorization',global.data.companyAuthToken)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result:[
                  {id:sharedCompanyDynamics.companyDynamic.id},
                  {id:sharedCompanyDynamics.companyDynamic2.id},
                  {id:sharedCompanyDynamics.companyDynamic3.id},
                ]
              });
              resolve();
            });
        });
      });

      it('get one should work',async function(){
        await new Promise(function (resolve,reject) {
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/companyDynamics/${sharedCompanyDynamics.companyDynamic.id}`)
            .set('Authorization',global.data.companyAuthToken)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {id:sharedCompanyDynamics.companyDynamic.id}
              });
              resolve();
            });
        });
      });

      it('get all should not work',async function(){
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company2.id}/companyDynamics`)
            .set('Authorization',global.data.company2AuthToken)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result:[]
              });
              resolve();
            });
        });
      });

      it('get one should not work',async function(){
        await new Promise(function (resolve,reject) {
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company2.id}/companyDynamics/${sharedCompanyDynamics.companyDynamic.id}`)
            .set('Authorization',global.data.company2AuthToken)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status:true,
                result:{}
              });
              resolve();
            });
        });
      });

    });

  });

  describe('create companyDynamic',function(){
    let data = {content:modelHelper.faker.comment().content};

    it('should work',async function(){
      await new Promise(function(resolve,reject){
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/companyDynamics`)
          .send(data)
          .set('Authorization',global.data.companyAuthToken)
          .end(function(err,res){
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status:true,
              result: {
                content:data.content,
                companyId:global.data.company.id
              }
            });
            resolve();
          });
      });
    });

    it('should not work without plan',async function(){
      await new Promise(function(resolve,reject){
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company2.id}/companyDynamics`)
          .send(data)
          .set('Authorization',global.data.company2AuthToken)
          .end(function(err,res){
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              message: "Not found",
              status: false
            });
            resolve();
          });
      });
    });

    it('should not work that planExpiredDate has expired!',async function(){
      let t = await models.sequelize.transaction();
      await models.Enterprise.update({planId:2,planExpiredDate:null},{where:{id:2},transaction:t});

      await new Promise(function(resolve,reject){
        request
          .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company2.id}/companyDynamics`)
          .send(data)
          .set('Authorization',global.data.company2AuthToken)
          .end(function(err,res){
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              message: "Not found",
              status: false
            });
            resolve();
          });
      });
    });


  });

  describe('delete companyDynamic',function () {
    it('should work',async function(){
      let companyDynamic = await createCompanyDynamic();
      await new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/companyDynamics/${companyDynamic.id}`)
          .set('Authorization',global.data.companyAuthToken)
          .end(function(err,res){
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status:true
            });
            resolve();
          });
      })
    });
  })

});
