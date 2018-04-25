// core
const debug = require('debug')('APP:CANDIDATE_SPEC');

// model
const models = require(__base + 'models');
const tag = require(__base + 'methods/tag');
const positionInvitationMethod = require(__base + 'methods/positionInvitationMethod');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);
// library
const _ = require('lodash');

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');


describe('CANDIDATE', function () {

  let settingRolePromise = function () {
    return models.Plan.update({
      meta: [{"type": "company", "expiredDate": 30, "positionNum": 100}]
    }, {
      where: {name: 'lite'}
    });
  };

  let clearCandidatePromise = function () {
    return models.Candidate.destroy({
      where: {
        id: {
          $ne: 0
        }
      }
    });
  };

  let clearPositionInvitationPromise = function () {
    return models.PositionInvitation.destroy({
      where: {
        id: {
          $ne: 0
        }
      }
    });
  };

  let clearQuestionPromise = function () {
    return models.PositionQuestion.destroy({
      where: {
        id: {
          $ne: 0
        }
      }
    });
  };


  let shared = {
    candidate: {},
    position: {},
    country: {},
    company: {},
    invitation: {},
    educationLevel: {},
    userEducation: {}
  };

// get country
  before(function () {
    shared.country = global.data.countries[0];
  });

// get education level
  before(function () {
    shared.educationLevel = global.data.educationLevels[0];
  });


// post education
  before(async function() {
    let data = modelHelper.faker.userEducation({
      educationLevelId: shared.educationLevel.id,
      schoolId: 1,
    });
    await new Promise(function (resolve, reject) {
      request
        .post(`${commonHelper.getUserAPIUrl()}/users/self/educations`)
        .send(data)
        .set('Authorization', global.data.userAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          expect(res.body).to.containSubset({
            status: true
          });
          shared.userEducation = res.body.result;
          resolve();
        });
    });

    // update enterprise balance
    data = modelHelper.faker.enterprise();
    await new Promise(function (resolve, reject) {
      request
        .put(`${commonHelper.getEnterpriseAPIUrl()}/enterprises/self`)
        .set('Authorization', global.data.companyAuthToken)
        .send(data)
        .end(function (err, res) {
          expect(res.body).to.containSubset({
            status: true
          });
          resolve();
        });
    });
  });

// create position
  before(async function() {
    // setting position counts
    await settingRolePromise();
    let data = modelHelper.faker.position({
      active: true,
      locationId: global.data.locations[1].id,
      categoryIds: [global.data.positionCategories[1].id],
      companyId: global.data.company.id,
      educationLevelId: shared.educationLevel.id,
      email:'zhengfei@yoov.com'
    });

    await new Promise(function (resolve, reject) {
      request
        .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions`)
        .send(data)
        .set('Authorization', global.data.companyAuthToken)
        .end(function (err, res) {
          expect(res.ok).to.be.true;
          expect(res.body).to.containSubset({
            status: true
          });
          shared.position = res.body.result;
          resolve();
        });
    });
  });

  describe('list candidate', function () {
    after(async function() {
      await clearCandidatePromise();
    });
    let sharedForListCandidate = {
      candidate: [],
    };
    before(async function() {
      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            resolve();
          });
      });
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/candidates`)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForListCandidate.candidate = res.body.result[0];
            resolve();
          });
      });
    });


    describe('by user:', function () {

      it('get positions\'s candidate subject chart should work', async function() {
        let data = modelHelper.faker.userEducation({
          educationLevelId: 2,
          schoolId: 1
        });
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/users/self/educations`)
            .set('Authorization', global.data.userAuthToken)
            .send(data)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });

        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/chart`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  totalCandidates: 1,
                  subject: [
                    {
                      sum: 1
                    }
                  ],
                }
              });
              resolve();
            });
        });
      });


      it('get positions\'s candidate skills chart should work', async function() {
        let data = [{"name": "test5"}, {"name": "ertert"}, {"name": "234234"}];
        await tag.retag('UserSkill', shared.userEducation.userId, _.map(data, 'name'));

        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/chart`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  totalCandidates: 1,
                  skills: [
                    {
                      sum: 1
                    }
                  ],
                }
              });
              resolve();
            });
        });
      });

      it('get positions\'s candidate school chart should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/chart`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  totalCandidates: 1,
                  school: [
                    {
                      sum: 1
                    }
                  ],
                }
              });
              resolve();
            });
        });
      });

      it('get positions\'s candidate educationLevels chart should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/chart`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  totalCandidates: 1,
                  educationLevels: [
                    {
                      id: shared.educationLevel.id,
                      value: 1
                    }
                  ],
                  yearOfExperience: [
                    {
                      name: 'N/A',
                      value: 1
                    }
                  ],
                }
              });
              resolve();
            });
        });
      });

      it('get positions\'s candidate chart should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/chart`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  totalCandidates: 1,
                  educationLevels: [
                    {
                      id: shared.educationLevel.id,
                      value: 1
                    }
                  ],
                  yearOfExperience: [
                    {
                      name: 'N/A',
                      value: 1
                    }
                  ],
                }
              });
              resolve();
            });
        });
      });

      it('get company\'s candidate chart should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/chart`)
            .set('Authorization', global.data.companyAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  totalCandidates: 1,
                  educationLevels: [
                    {
                      id: shared.educationLevel.id,
                      value: 1
                    }
                  ],
                  yearOfExperience: [
                    {
                      name: 'N/A',
                      value: 1
                    }
                  ],
                }
              });
              resolve();
            });
        });
      });

    });

    describe('be user(applier):', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getUserAPIUrl()}/candidates`)
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
      it('should exclude `isRead` field', function () {
        expect(sharedForListCandidate.candidate).to.not.include.keys('isRead');
      });
      // it('should exclude `candidateStatusId` field', function () {
      //   expect(sharedForListCandidate.candidate).to.not.include.keys('candidateStatusId');
      // });
      // it('should exclude `candidateStatus` field', function () {
      //   expect(sharedForListCandidate.candidate).to.not.include.keys('candidateStatus');
      // });
    });

    describe('be company:', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/candidates`)
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

      it('filter `candidateStatusId` integer should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .get(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/candidates`)
            .query({
              candidateStatusId: '2',
            })
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

  describe('Create candidate', function () {
    afterEach(async function() {
      await clearCandidatePromise();
      await clearPositionInvitationPromise();
    });

    describe('be user:', function () {
      before(async function() {
        let data = {
          "companyId": global.data.company.id,
          "positionId": shared.position.id,
          "maxCost": 200,
          "filter": [
            {
              "name": "Degree",
              "type": "education",
              "educationLevelId": shared.userEducation.educationLevelId,
            }
          ]
        };
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/position_invitation_jobs`)
            .send(data)
            .set('Authorization', global.data.companyAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              shared.invitation = res.body.result;
              resolve();
            });
        });
      });

      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve(res.ok);
            });
        });
      });

      it('should not allow to apply more than one time', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.false;
              expect(res.body).to.containSubset({
                status: false,
                code: 50000
              });
              resolve();
            });
        });
      });

      // apply second time with invitation should work
      // 有邀请职位,普通申请,不应该工作,邀请职位申请,应工作.
      // 1. isInvitation = false 2. isInvitation = true
      // 先普通申请,后邀请申请 通过 isInvitation = true
      it('apply second time with invitation should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });

        await positionInvitationMethod.createInvitation(shared.position.id, global.data.userAuth.id, shared.invitation.id, global.data.company.id);

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .send({isInvitation: true})
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

      // apply second time with invalid invitation should not work
      // 使用无效的职位邀请不应该工作.
      // 1. isInvitation = false 2. isInvitation = true
      it('apply second time with invalid invitation should not work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .send({isInvitation: true})
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.false;
              expect(res.body).to.containSubset({
                status: false,
                code: 50003
              });
              resolve();
            });
        });
      });

      // accept invitation should work
      // 有职位邀请,申请应该工作.
      // 1. isInvitation = true
      it('accept invitation should work', async function() {
        await positionInvitationMethod.createInvitation(shared.position.id, global.data.userAuth.id, shared.invitation.id, global.data.company.id);

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .send({isInvitation: true})
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

      // accept invitation more than one time should not work
      // 两次申请同一个邀请,不应该工作
      // 1. isInvitation = true 2. isInvitation = true
      it('accept invitation more than one time should not work', async function() {
        await positionInvitationMethod.createInvitation(shared.position.id, global.data.userAuth.id, shared.invitation.id, global.data.company.id);

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .send({isInvitation: true})
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .send({isInvitation: true})
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.false;
              expect(res.body).to.containSubset({
                status: false,
                code: 50000
              });
              resolve();
            });
        });
      });

      // accept invitation second time without invitation should not work
      // 没有职位邀请,不应该工作.
      // 1. isInvitation = true 2. isInvitation = false
      it('accept invitation more than one time should not work', async function() {
        await positionInvitationMethod.createInvitation(shared.position.id, global.data.userAuth.id, shared.invitation.id, global.data.company.id);

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .send({isInvitation: true})
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true
              });
              resolve();
            });
        });

        await new Promise(function (resolve, reject) {
          request
            .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
            .send({isInvitation: false})
            .set('Authorization', global.data.userAuthToken)
            .end(function (err, res) {
              expect(res.ok).to.be.false;
              expect(res.body).to.containSubset({
                status: false,
                code: 50000
              });
              resolve();
            });
        });
      });

      describe('with question:', function () {
        let sharedQuestion = {
          question: []
        };
        it('add with question', async function() {
          // 添加问题
          let data = {
            question: '问题1',
            isRequired: true
          };
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/positions/${shared.position.id}/questions`)
              .set('Authorization', global.data.companyAuthToken)
              .send(data)
              .end(function (err, res) {
                expect(res.ok).to.be.true;
                expect(res.body).to.containSubset({
                  status: true
                });
                sharedQuestion.question = res.body.result;
                resolve();
              });
          });
        });

        it('should work', async function() {
          let data1 = {question: [{questionId: sharedQuestion.question[0].id, answer: 'aaaa'}]};
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
              .send(data1)
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

        debug('申请职位. 未回答问题.');
        it('isRequired should work', async function() {
          await new Promise(function (resolve, reject) {
            request
              .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
              .set('Authorization', global.data.userAuthToken)
              .end(function (err, res) {
                expect(res.ok).to.be.false;
                expect(res.body).to.containSubset({
                  status: false,
                  code: 50001
                });
                resolve();
              });
          });

        });

      });
    });
  });

  describe('update candidate', function () {
    afterEach(async function() {
      await clearCandidatePromise();
    });
    let sharedForUpdateCandidate = {
      candidate: []
    };
    before(async function() {
      await clearQuestionPromise();

      await new Promise(function (resolve, reject) {
        request
          .post(`${commonHelper.getUserAPIUrl()}/positions/${shared.position.id}/apply`)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            resolve();
          });
      });
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getUserAPIUrl()}/candidates`)
          .set('Authorization', global.data.userAuthToken)
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            expect(res.body).to.containSubset({
              status: true
            });
            sharedForUpdateCandidate.candidate = res.body.result[0];
            resolve();
          });
      });
    });

    describe('by user(company):', function () {
      it('should work', async function() {
        await new Promise(function (resolve, reject) {
          request
            .put(`${commonHelper.getEnterpriseAPIUrl()}/companies/${global.data.company.id}/candidates/${sharedForUpdateCandidate.candidate.id}`)
            .set('Authorization', global.data.companyAuthToken)
            .send({
              candidateStatusId: 2
            })
            .end(function (err, res) {
              expect(res.ok).to.be.true;
              expect(res.body).to.containSubset({
                status: true,
                result: {
                  candidateStatusId: 2
                }
              });
              resolve();
            });
        });
      });
    });

  });
})
;

