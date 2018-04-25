const _ = require('lodash');
const models = require('../../models');
const faker = require('faker');
const moment = require('moment');
const modelHelper = {
  faker: {}
};

modelHelper.faker.enterprise = function () {
  return {
    lastName: faker.name.lastName(),
    firstName: faker.name.firstName(),
    active: true,
    email: faker.internet.email(),
    balance: 200,
    positionLimit: 0,
  };
};

modelHelper.faker.user = function () {
  return {
    lastName: faker.name.lastName(),
    firstName: faker.name.firstName(),
    gender: faker.random.arrayElement(['M', 'F']),
    active: true,
    email: faker.internet.email(),
    birth: moment(faker.date.recent()).format('YYYY-MM-DD'),
    phone: faker.phone.phoneNumber(),
    selfDescription: faker.lorem.text(),
    profilePrivacy: faker.random.boolean(),
  };
};

modelHelper.faker.company = function (param) {
  param = param || {};
  return _.extend({
    enterpriseId: 1,
    countryId: param.countryId,
    name: faker.company.companyName(),
    scale: faker.random.arrayElement(['myself-only', '2-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+']),
    field: faker.company.companyName(),
    stage: faker.random.arrayElement(['public-company', 'educational', 'self-employed', 'government-agency', 'non-profit', 'self-owned', 'privately-held', 'partnership']),
    background: faker.company.companyName(),
    foundingTime: faker.date.recent(),
    url: 'http://yoov.com',
    examine: true,
    isApproved: param.isApproved,
    address: faker.address.secondaryAddress(),
    description: faker.lorem.paragraph()
  }, param);
};

modelHelper.faker.admin = function () {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    password: '123456',
    email: faker.internet.email(),
    mobilePhone: faker.phone.phoneNumber(),
    homePhone: faker.phone.phoneNumber()
  };
};

modelHelper.faker.adminAuth = function () {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    password: '123456',
    email: 'zhengfei@yoov.com',
    mobilePhone: faker.phone.phoneNumber()
  };
};

modelHelper.faker.educationLevel = function () {
  return {
    'name': faker.name.firstName(),
    'description': faker.lorem.paragraph()
  };
};

modelHelper.faker.post = function (param) {
  param = param || {};

  return _.extend({
    active: true,
    isApproved: true,
    title: faker.name.firstName(),
    content: faker.lorem.paragraph(),
  }, param);
};

modelHelper.faker.comment = function (param) {
  param = param || {};

  return _.extend({
    content: faker.lorem.paragraph(),
  }, param);
};

modelHelper.faker.postCategory = function (param) {
  param = param || {};

  return _.extend({
    'parentId': 1,
    'name': faker.name.firstName(),
    'description': faker.lorem.paragraph()
  }, param);

};

modelHelper.faker.position = function (param) {
  param = param || {};

  return _.extend({
    companyId: param.companyId,
    educationLevelId: param.educationLevelId,
    name: faker.name.firstName(),
    type: faker.random.arrayElement(['full-time', 'part-time', 'internship', 'freelance', 'others']),
    minSalary: 1,
    maxSalary: 2,
    postedDate: '2016-11-11',
    experience: faker.random.arrayElement(['0', '0.5', '1', '2', '3', '4', '5', '5+']),
    temptation: faker.name.firstName(),
    address: faker.address.secondaryAddress(),
    description: faker.lorem.paragraph()
  }, param);
};

modelHelper.faker.positionCategory = function (param) {
  param = param || {};

  return _.extend({
    'parentId': 1,
    'name': faker.name.firstName(),
    'description': faker.lorem.paragraph()
  }, param);

};

modelHelper.faker.postCategories = function () {
  return _.extend([
    {id: 1, name: 'Hong Kong', order: 0},
    {id: 2, parentId: 1, name: 'Aberdeen', order: 0},
    {id: 3, parentId: 1, name: 'Admiralty', order: 0},
    {id: 4, parentId: 1, name: 'Admiralty', order: 0},
    {id: 5, parentId: 1, name: 'Admiralty', order: 0},
    {id: 6, parentId: 1, name: 'Admiralty', order: 0},
    {id: 7, parentId: 1, name: 'Admiralty', order: 0},
    {id: 8, parentId: 1, name: 'Admiralty', order: 0},
    {id: 9, parentId: 1, name: 'Admiralty', order: 0},
    {id: 10, parentId: 1, name: 'Admiralty', order: 0},
    {id: 11, parentId: 1, name: 'Admiralty', order: 0},
    {id: 12, parentId: 1, name: 'Admiralty', order: 0},
    {id: 13, parentId: 1, name: 'Admiralty', order: 0},
  ]);
};

modelHelper.faker.positionCategories = function () {
  return _.extend([
    {id: 1, name: 'Hong Kong', order: 0},
    {id: 2, parentId: 1, name: 'Aberdeen', order: 0},
    {id: 3, parentId: 1, name: 'Admiralty', order: 0},
    {id: 4, parentId: 1, name: 'Admiralty', order: 0},
    {id: 5, parentId: 1, name: 'Admiralty', order: 0},
    {id: 6, parentId: 1, name: 'Admiralty', order: 0},
    {id: 7, parentId: 1, name: 'Admiralty', order: 0},
    {id: 8, parentId: 1, name: 'Admiralty', order: 0},
    {id: 9, parentId: 1, name: 'Admiralty', order: 0},
    {id: 10, parentId: 1, name: 'Admiralty', order: 0},
    {id: 11, parentId: 1, name: 'Admiralty', order: 0},
    {id: 12, parentId: 1, name: 'Admiralty', order: 0},
    {id: 13, parentId: 1, name: 'Admiralty', order: 0},
  ]);
};


modelHelper.faker.userEducation = function (param) {
  param = param || {};

  return _.extend({
    educationLevelId: param.educationLevelId,
    schoolId: param.schoolId,
    graduationYear: faker.random.number({
      min: 1980,
      max: 2015
    }),
    gpa: `${faker.random.number({
      min: 1,
      max: 5
    })}.${faker.random.number({
      min: 0,
      max: 9
    })}`,
    schoolName: faker.name.firstName(),
    subject: faker.name.firstName(),
    remark: faker.lorem.paragraph()
  }, param);
};

modelHelper.faker.userExpectJob = function (param) {
  param = param || {};

  return _.extend({
    expectPositionId: 2,
    jobNatureId: param.jobNatureId,
    content: faker.lorem.paragraph(),
    salaryType: faker.random.arrayElement(['hourly', 'monthly', 'yearly']),
    type: faker.random.arrayElement(['full-time', 'part-time', 'internship', 'freelance', 'others']),
    locationId: 2,
    minSalary: 1000,
    maxSalary: 2000,
  }, param);

};

modelHelper.faker.userExperience = function () {
  return {
    companyName: faker.company.companyName(),
    title: faker.company.companyName(),
    startedDate: moment(faker.date.recent()).format('YYYY-MM-DD'),
    endedDate: moment(faker.date.recent()).format('YYYY-MM-DD'),
    remark: faker.lorem.paragraph(),
    description: faker.lorem.paragraph()
  };
};

modelHelper.faker.upload = function () {
  return {
    name: 'test',
    uploadTypeId: 3
  };
};


modelHelper.faker.userPortfolio = function (param) {
  param = param || {};
  return _.extend({
    'title': faker.company.companyName(),
    'description': faker.lorem.paragraph(),
    'url': faker.image.imageUrl()
  }, param);
};

modelHelper.faker.userProject = function () {
  return {
    'name': faker.company.companyName(),
    'duty': faker.company.companyName(),
    'startDate': faker.date.recent(),
    'endDate': faker.date.recent(),
    'url': faker.image.imageUrl()
  };
};

modelHelper.faker.userSkill = function () {
  return {
    'name': faker.company.companyName(),
  };
};

modelHelper.faker.country = function () {
  return {
    depth: 1,
    code: faker.address.countryCode(),
    name: faker.company.companyName()
  };
};

modelHelper.faker.currency = function () {
  return {
    code: faker.address.countryCode(),
    name: 'Azerbaijani Manats',
    symbol: '$'
  };
};

modelHelper.faker.question = function (param) {
  param = param || {};
  return _.extend({
    question: faker.company.companyName(),
    isRequired: faker.random.boolean(),
  }, param);
};

module.exports = modelHelper;
