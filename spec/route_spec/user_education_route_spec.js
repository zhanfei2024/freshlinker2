// core
const debug = require('debug')('APP:USER_EDUCATION_SPEC');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');

describe('USER EDUCATION', function () {
  let shared = {
    userEducation: {},
    educationLevel: {},
    school: {}
  };

  // get education level
  before(function () {
    shared.educationLevel = global.data.educationLevels[0];
  });

  // create school
  before(async function() {
    await new Promise(function (resolve, reject) {
      request
        .post(`${commonHelper.getAdminAPIUrl()}/schools`)
        .send({
          name: 'abc',
          url: 'http://yahoo.com'
        })
        .set('Authorization', global.data.adminAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          expect(res.body).to.containSubset({
            status: true
          });
          shared.school = res.body.result;
          resolve();
        });
    });
  });

  describe('List user education', function () {
    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/users/self/educations`)
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

    //TODO get one should work

  });

  describe('Create user education', function () {
    describe('validation:', function () {




    });
    describe('field:', function () {
      let data = modelHelper.faker.userEducation();
      let sharedForUpdateField = {
        education: []
      };
      before(async function() {
        data.educationLevelId = shared.educationLevel.id;
        data.schoolId = shared.school.id;
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/educations`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              sharedForUpdateField.education = res.body.result;
              resolve();
            });
        });
      });

      it('update `subject` should work', function () {
        expect(sharedForUpdateField.education.subject).eql(data.subject);
      });
      it('update `educationLevelId` should work', function () {
        expect(sharedForUpdateField.education.educationLevelId).eql(data.educationLevelId);
      });
      it('update `schoolId` should work', function () {
        debug(data, sharedForUpdateField.education)
        expect(sharedForUpdateField.education.schoolId).eql(data.schoolId);
      });
      it('update `gpa` should work', function () {
        expect(sharedForUpdateField.education.gpa).eql(data.gpa);
      });
      it('update `graduationYear` should work', function () {
        expect(sharedForUpdateField.education.graduationYear).eql(data.graduationYear);
      });
      it('update `remark` should work', function () {
        expect(sharedForUpdateField.education.remark).eql(data.remark);
      });
    });
  });


  describe('Update user education', function () {
    describe('field:', function () {
      let data = modelHelper.faker.userEducation();
      let sharedForUpdateField = {
        education: []
      };
      before(async function() {
        data.educationLevelId = shared.educationLevel.id;
        data.schoolId = shared.school.id;

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/educations`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              sharedForUpdateField.education = res.body.result;
              resolve();
            });
        });

        data = modelHelper.faker.userEducation();
        data.educationLevelId = shared.educationLevel.id;
        data.schoolId = shared.school.id;
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getUserAPIUrl()}/users/self/educations/${sharedForUpdateField.education.id}`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              sharedForUpdateField.education = res.body.result;
              resolve();
            });
        });
      });

      it('update `subject` should work', function () {
        expect(sharedForUpdateField.education.subject).eql(data.subject);
      });
      it('update `educationLevelId` should work', function () {
        expect(sharedForUpdateField.education.educationLevelId).eql(data.educationLevelId);
      });
      it('update `schoolId` should work', function () {
        debug(data, sharedForUpdateField.education)
        expect(sharedForUpdateField.education.schoolId).eql(data.schoolId);
      });
      it('update `gpa` should work', function () {
        expect(sharedForUpdateField.education.gpa).eql(data.gpa);
      });
      it('update `graduationYear` should work', function () {
        expect(sharedForUpdateField.education.graduationYear).eql(data.graduationYear);
      });
      it('update `remark` should work', function () {
        expect(sharedForUpdateField.education.remark).eql(data.remark);
      });
    });
  });

  describe('Delete user education', function () {
    let sharedForDeleteField = {
      education: []
    };
    beforeEach(async function() {
        let data = modelHelper.faker.userEducation();
        data.educationLevelId = shared.educationLevel.id;
        data.schoolId = shared.school.id;

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/educations`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              sharedForDeleteField.education = res.body.result;
              resolve();
            });
        });
    });
    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .delete(`${commonHelper.getUserAPIUrl()}/users/self/educations/${sharedForDeleteField.education.id}`)
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
