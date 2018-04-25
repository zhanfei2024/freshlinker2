'use strict';

global.__base = __dirname + '/../../';

// core
const debug = require('debug')('APP:TEST');
const http = require('http');

// library
const _ = require('lodash');
const models = require(__base + 'models');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

// s3 lib
const S3rver = require('s3rver');
const AWS = require('aws-sdk');
const async = require('async');
const fs = require('fs-extra');
const util = require('util');
const moment = require('moment');

// helper
const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');

const app = http.createServer(require(__base + 'app'));
let s3FakeClient;

global.data = {
  adminAuth: {},
  adminAuthToken: {},

  company: {},
  companyAuth: {},
  companyAuthToken: commonHelper.getUserLoginTokenById(3),
  company2: {},
  company2Auth: {},
  company2AuthToken: commonHelper.getUserLoginTokenById(4),
  inactiveCompany: {},
  inactiveCompanyAuth: {},
  inactiveCompanyAuthToken: commonHelper.getUserLoginTokenById(5),

  userAuth: {},
  userAuthToken: commonHelper.getUserLoginTokenById(6),
  user2Auth: {},
  user2AuthToken: commonHelper.getUserLoginTokenById(7),
  user3Auth: {},
  user3AuthToken: commonHelper.getUserLoginTokenById(8),
  inactiveUserAuth: {},
  inactiveUserAuthToken: commonHelper.getUserLoginTokenById(9),

  countries: [],
  languages: [],
  locations: [],
  educationLevels: [],
  positionCategories: [],
  postCategories: [],
  plans: [],
  jobNature: [],
};

// ==========================
// init Auth0
// ==========================
const nock = require('nock');
before(async function() {
  nock('https://yoov-test.auth0.com/.well-known/jwks.json')
    .get('')
    .reply(200, {
      keys: [global.publicJWK],
    });
});

// ==========================
// init database
// ==========================

before(async function () {
  this.timeout(50000);
  app.listen(7777);

  try {
    // database reset
    await models.sequelize.sync({force: 1});

    let result = await Promise.all([
      await models.Currency.initSeed(),
      await models.Country.initSeed(),
      await models.Language.initSeed(),
      await models.CandidateStatus.initSeed(),
      await models.AuthenticationProviderType.initSeed(),
      await models.EducationLevel.initSeed(),
      await models.Admin.initSeed(),
      await models.Plan.initSeed(),
      await models.JobNature.initSeed(),
      await models.Setting.initSeed(),
    ]);

    let allPromise = [];
    let schoolData = [
      {name: 'The University of Hong Kong'},
      {name: 'The Chinese University of Hong Kong'},
      {name: 'The Hong Kong University of Science and Technology'},
      {name: 'City University of Hong Kong'},
      {name: 'The Hong Kong Polytechnic University'},
      {name: 'Hong Kong Baptist University'},
      {name: 'Lingnan University'},
      {name: 'The Education University of Hong Kong'},
    ];
    allPromise.push(importSchool(schoolData));
    Promise.all(allPromise);
    debug(`Imported school data!`);

    global.data.countries = result[1];
    global.data.languages = result[2];
    global.data.educationLevels = result[5];
    global.data.plans = result[7];
    global.data.jobNature = result[8];

    let data = [
      {name: 'Parent', order: 0},
      {name: 'Children 1', order: 0},
      {name: 'Parent 2', order: 0},
      {name: 'Children 2', order: 0},
    ];
    global.data.locations[0] = await models.Location.create(data[0]);
    global.data.locations[1] = await models.Location.create(_.defaults({parentId: global.data.locations[0].id}, data[1]));

    global.data.positionCategories[0] = await models.PositionCategory.create(data[0]);
    global.data.positionCategories[1] = await models.PositionCategory.create(_.defaults({parentId: global.data.positionCategories[0].id}, data[1]));

    global.data.postCategories[0] = await models.PostCategory.create(data[0]);
    global.data.postCategories[1] = await models.PostCategory.create(_.defaults({parentId: global.data.postCategories[0].id}, data[1]));
    global.data.postCategories[2] = await models.PostCategory.create(data[2]);
    global.data.postCategories[3] = await models.PostCategory.create(_.defaults({parentId: global.data.postCategories[2].id}, data[3]));

    debug('Database has been reset!');
  } catch (err) {
    debug(`VALUE ERROR: %j`, err);
  }
});

function importSchool(data) {
  let promise = [];
  _.each(data, function (val) {
    try {
      promise.push(
        new Promise(function (resolve, reject) {
          models.School.create(val);
        })
      );
    } catch (err) {
      debug(`ERROR from importSchool: %j`, err);
    }
  });
  return Promise.all(promise);
}

// ==========================
// create fake s3 server
// ==========================
before(function (done) {
  let buckets = ['freshlinker'];
  s3FakeClient = new S3rver({
    port: 4569,
    hostname: 'localhost',
    silent: false,
    directory: '/tmp/s3rver_test_directory'
  }).run(function (err, hostname, port, directory) {
    if (err) {
      return done('Error starting server', err);
    }
    let config = {
      accessKeyId: '123',
      secretAccessKey: 'abc',
      endpoint: util.format('%s:%d', hostname, port),
      sslEnabled: false,
      s3ForcePathStyle: true
    };
    AWS.config.update(config);
    let s3Client = new AWS.S3();
    s3Client.endpoint = new AWS.Endpoint(config.endpoint);
    /**
     * Remove if exists and recreate the temporary directory
     */
    fs.remove(directory, function (err) {
      if (err) {
        return done(err);
      }
      fs.mkdirs(directory, function (err) {
        if (err) {
          return done(err);
        }
        async.eachSeries(buckets, function (bucket, callback) {
          s3Client.createBucket({Bucket: bucket}, callback);
        }, done);
      });
    });
  });
});

// ==========================
// get main admin
// ==========================
before(async function () {
  let data = {
    email: 'hello@freshlinker.com',
    password: 'kenwong1120'
  };
  await new Promise(function (resolve, reject) {
    request
      .post(`${commonHelper.getAdminAPIUrl()}/admin_auth/login`)
      .send(data)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        expect(res.body).to.containSubset({
          status: true
        });
        global.data.adminAuthToken = 'Bearer ' + res.body.result;
        resolve();
      });
  });
});

// ==========================
// get main user
// ==========================
let initUser = async function(token, data, role) {
  let userData = modelHelper.faker.user();
  let user = await new Promise(function (resolve, reject) {
    request
      .get(`${commonHelper.getUserAPIUrl()}/activate`)
      .send(userData)
      .set('Authorization', token)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        expect(res.body.result).to.have.property('id');
        resolve(res.body.result);
      });
  });

  // update
  await new Promise(function (resolve, reject) {
    request
      .put(`${commonHelper.getAdminAPIUrl()}/users/${user.id}`)
      .send(data)
      .set('Authorization', global.data.adminAuthToken)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve();
      });
  });

  return new Promise(function (resolve, reject) {
    request
      .get(`${commonHelper.getUserAPIUrl()}/users/self`)
      .set('Authorization', token)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        expect(res.body.result).to.have.property('id');
        resolve(res.body.result);
      });
  });
};

let initEnterprise = async function(token, data, role) {
  let enterprise = await new Promise(function (resolve, reject) {
    request
      .get(`${commonHelper.getEnterpriseAPIUrl()}/activate`)
      .set('Authorization', token)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        expect(res.body.result).to.have.property('id');
        resolve(res.body.result);
      });
  });

  // update
  await new Promise(function (resolve, reject) {
    request
      .put(`${commonHelper.getAdminAPIUrl()}/enterprises/${enterprise.id}`)
      .send(data)
      .set('Authorization', global.data.adminAuthToken)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve();
      });
  });

  return new Promise(function (resolve, reject) {
    request
      .get(`${commonHelper.getEnterpriseAPIUrl()}/enterprises/self`)
      .set('Authorization', token)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        expect(res.body.result).to.have.property('id');
        resolve(res.body.result);
      });
  });
};

let addCompany = async function(userToken, active) {
  let data = modelHelper.faker.company({
    countryId: 1,
  });

  let company = await new Promise(function (resolve, reject) {
    request
      .post(`${commonHelper.getEnterpriseAPIUrl()}/companies`)
      .send(data)
      .set('Authorization', userToken)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve(res.body.result);
      });
  });
  return new Promise(function (resolve, reject) {
    request
      .put(`${commonHelper.getAdminAPIUrl()}/companies/${company.id}`)
      .send({
        isApproved: active
      })
      .set('Authorization', global.data.adminAuthToken)
      .end(function (err, res) {
        expect(res.ok).to.be.true;
        resolve(company);
      });
  });
};
before(async function () {
  global.data.userAuth = await initUser(global.data.userAuthToken, {active: true}, 'user');
  global.data.user2Auth = await initUser(global.data.user2AuthToken, {active: true}, 'user');
  global.data.user3Auth = await initUser(global.data.user3AuthToken, {active: true}, 'user');
  global.data.inactiveUserAuth = await initUser(global.data.inactiveUserAuthToken, {active: false}, 'user');

  global.data.companyAuth = await initEnterprise(global.data.companyAuthToken, {
    active: true,
    planExpiredDate: moment().add(999, 'd').format('YYYY-MM-DD'),
    positionQuota: 999
  }, 'company');
  global.data.company2Auth = await initEnterprise(global.data.company2AuthToken, {
    active: true,
  }, 'company');
  global.data.inactiveCompanyAuth = await initEnterprise(global.data.inactiveCompanyAuthToken, {active: false}, 'company');

  global.data.company = await addCompany(global.data.companyAuthToken, true);
  global.data.company2 = await addCompany(global.data.company2AuthToken, true);
  global.data.inactiveCompany = await addCompany(global.data.inactiveCompanyAuthToken, false);
});

after(async function () {
  //timeout(function () {
  //  if (typeof s3FakeClient !== 'undefined') s3FakeClient.close();
  //}, 100000);
});

after(async function () {
  this.timeout(15000);
  app.listen(7777, function () {
    app.close();
  });
});
