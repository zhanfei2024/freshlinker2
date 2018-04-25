// core
const debug = require('debug')('APP:TAG_SPEC');

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

describe('TAG', function () {

  describe('by public:', function () {
    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getPublicAPIUrl()}/tags`)
          .query({
            search: 'abc'
          })
          .end(function (err, res) {
            expect(res.ok).to.be.true;
            resolve();
          });
      });
    });
  });

});
