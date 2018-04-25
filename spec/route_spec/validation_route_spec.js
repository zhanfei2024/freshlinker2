// core
const debug = require('debug')('APP:VALIDATION_SPEC');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

describe('VALIDATION', function () {

  describe('pick method:', function () {
    let sharedForPick = {
      rules: {
        required: 'required',
        type: 'in:full-time,part-time,internship,freelance,others',
        minSalary: 'integer',
        maxSalary: 'integer',
        experience: 'in:0,0.5,1,2,3,4,5,5+',
        educationLevelId: 'integer|exists:EducationLevel,id',
        postedDate: 'date',
        expiredDate: 'date',
        companyId: 'integer|exists:Company,id',
        categoryIds: 'array',
        'categoryIds.*': 'integer',
        isApproved: 'boolean'
      }
    };

    it('should work', async function() {
      let data = {
        categoryIds: [1, 2, 3]
      };
      let input = validateHelper.pick(data, sharedForPick.rules);
      expect(input).to.include.keys('categoryIds');
    });

    it('`exclude` param should work', async function() {
      let data = {
        'categoryIds.*': 'abc'
      };
      let input = validateHelper.pick(data, sharedForPick.rules, ['categoryIds.*']);
      expect(input).to.not.include.keys('categoryIds.*');
    });

    it('`include` param should work', async function() {
      let data = {
        'categoryIds': ''
      };
      let input = validateHelper.pick(data, sharedForPick.rules, ['categoryIds.*'], ['categoryIds']);
      expect(input).to.include.keys('categoryIds');
    });

    it('`integer` parse type should work', async function() {
      let data = {
        'companyId': '555'
      };
      let input = validateHelper.pick(data, sharedForPick.rules);
      expect(input.companyId).to.eql(555);
    });

    it('`boolean` parse type should work', async function() {
      let data = {
        isApproved: 'true'
      };
      let input = validateHelper.pick(data, sharedForPick.rules);
      expect(input.isApproved).to.eql(true);
    });

    it('skippable field(empty string) should be exclude', async function() {
      let data = {
        'companyId': ''
      };
      let input = validateHelper.pick(data, sharedForPick.rules);
      expect(input).to.not.include.keys('companyId');
    });

    it('skippable field(undefined) should be exclude', async function() {
      let data = {
        'companyId': undefined
      };
      let input = validateHelper.pick(data, sharedForPick.rules);
      expect(input).to.not.include.keys('companyId');
    });

  });

});

