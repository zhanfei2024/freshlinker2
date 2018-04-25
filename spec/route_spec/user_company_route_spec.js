// core
const debug = require('debug')('APP:USER_COMPANY_SPEC');

// model
const models = require(__base + 'models');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');

// library
const _ = require('lodash');

//create company
function createCompany(data,companyToken){
  return new Promise(function (resolve,reject) {
    request
      .post(`${commonHelper.getEnterpriseAPIUrl()}/companies`)
      .send(modelHelper.faker.company(data))
      .set('Authorization', companyToken)
      .end(function (err, res){
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      });
  });
};

//update company: isApproved true
function updateCompany(company){
  return new Promise(function(resolve,reject){
    request
      .put(`${commonHelper.getAdminAPIUrl()}/companies/${company.id}`)
      .set('Authorization', global.data.adminAuthToken)
      .send({isApproved: true})
      .end(function (err,res){
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      });
  });
};

//create apply
function createUserCompany(userToken){
  return new Promise(function(resolve,reject){
    request
      .post(`${commonHelper.getUserAPIUrl()}/company/apply`)
      .send({companyName: 'yoov'})
      .set('Authorization', userToken)
      .end(function(err,res) {
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      });
  });
}

//create data
let sharedCompany = {
  company: {},
  company2: {},
  company3: {}
};
let data = {
  company: {name: 'yoov',countryId:1},
  company2: {name: '小米',countryId:2},
  company3: {name: 'Google',countryId:3}
};
let sharedUserCompanies = {
  userCompany:{},
  userCompany2:{},
};

describe('user company', function(){
  //create company: isApproved false
  before(async function() {
    sharedCompany.company = await createCompany(data.company,global.data.companyAuthToken);
    sharedCompany.company2 = await createCompany(data.company2,global.data.company2AuthToken);
    sharedCompany.company3 = await createCompany(data.company3,global.data.companyAuthToken);
  });
  //updata company: isApproved true
  before(async function() {
    sharedCompany.company = await updateCompany(sharedCompany.company);
    sharedCompany.company2 = await updateCompany(sharedCompany.company2);
  });
  // create userCompany: user apply company
  before(async function() {
    sharedUserCompanies.userCompany = await createUserCompany(global.data.userAuthToken);
    sharedUserCompanies.userCompany2 = await createUserCompany(global.data.user2AuthToken);
  });

  describe('user apply', function(){

    it('should not work when company`s isApproved is false',async function(){
      await new Promise(function(resolve,reject){
        request
          .post(`${commonHelper.getUserAPIUrl()}/company/apply`)
          .send({companyName: 'Google'})
          .set('Authorization', global.data.userAuthToken)
          .end(function(err,res) {
            expect(res.ok).to.be.false;
            expect(res.body).to.containSubset({
              status: false,
              message: 'The selected companyName is invalid'
            });
            resolve();
          });
      });
    });

    it('should work when company`s isApproved is true', async function(){
      await new Promise(function(resolve,reject){
        request
        .post(`${commonHelper.getUserAPIUrl()}/company/apply`)
        .send({companyName: '小米'})
        .set('Authorization', global.data.userAuthToken)
        .end(function(err,res){
          expect(res.ok).to.be.true;
          expect(res.body).to.containSubset({
            status: true,
            result: {
              status: "pending",
              companyId: sharedCompany.company2.id
            }
          });
          resolve();
        });
      });
    });

    it('should work when userCompany`s status is `pending`', async function(){
      await new Promise(function(resolve,reject){
        request
          .post(`${commonHelper.getUserAPIUrl()}/company/apply`)
          .send({companyName: 'yoov'})
          .set('Authorization', global.data.userAuthToken)
          .end(function(err,res){
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true,
              result: {
                status: "pending",
                companyId: sharedCompany.company.id
              }
            });
            resolve();
          });
      });
    });

  });

  describe('Company processing applications', function(){

    describe('list user apply',function(){

      it('get all should work',async function(){
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${sharedCompany.company.id}/userCompanies`)
            .set('Authorization',global.data.companyAuthToken)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: [
                  {id: sharedUserCompanies.userCompany.id},
                  {id: sharedUserCompanies.userCompany2.id}
                ]
              });
              resolve();
            });
        });
      });

      it('get one should work',async function(){
        await new Promise(function(resolve,reject){
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${sharedCompany.company.id}/userCompanies/${sharedUserCompanies.userCompany.id}`)
            .set('Authorization',global.data.companyAuthToken)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });
      });
    });

    describe('update user apply',function(){

      it('should work when passing the apply',async function(){
        await new Promise(function(resolve,reject){
          request
            .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${sharedCompany.company.id}/userCompanies/${sharedUserCompanies.userCompany.id}`)
            .set('Authorization',global.data.companyAuthToken)
            .send({status:'pass'})
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result:{status:'pass'}
              });
              resolve();
            });
        });
      });

      it('should work when rejecting the apply',async function(){
        await new Promise(function(resolve,reject){
          request
            .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${sharedCompany.company.id}/userCompanies/${sharedUserCompanies.userCompany2.id}`)
            .set('Authorization',global.data.companyAuthToken)
            .send({status:'fail'})
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result:{status:'fail'}
              });
              resolve();
            });
        });
      });

    });

    describe('replace previous application',function(){

      it('should work when userCompany`s status is `pass`',async function(){
        await new Promise(function(resolve,reject){
          request
            .post(`${commonHelper.getUserAPIUrl()}/company/apply`)
            .send({companyName: '小米'})
            .set('Authorization', global.data.userAuthToken)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  status: "pending",
                  companyId: sharedCompany.company2.id
                }
              });
              resolve();
            });
        });
      });

      it('should work when userCompany`s status is `fail`',async function(){
        await new Promise(function(resolve,reject){
          request
            .post(`${commonHelper.getUserAPIUrl()}/company/apply`)
            .send({companyName: '小米'})
            .set('Authorization', global.data.user2AuthToken)
            .end(function(err,res){
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  status: "pending",
                  companyId: sharedCompany.company2.id
                }
              });
              resolve();
            });
        });
      });

    });

  });

});
