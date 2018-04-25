// core
const debug = require('debug')('APP:COUNTRY_SPEC');

// test lib
const request = require('superagent');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
chai.use(chaiSubset);

const commonHelper = require('../helpers/common_helper');
const modelHelper = require('../helpers/model_helper');


describe('country', function () {
  let shared = {
    country: {}
  };

  describe('List Country', function () {
    it('should work', async function() {
      await new Promise(function (resolve, reject) {
        request
          .get(`${commonHelper.getPublicAPIUrl()}/countries`)
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
