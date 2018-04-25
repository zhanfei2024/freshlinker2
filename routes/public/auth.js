'use strict';

const debug = require('debug')('APP:PUBLIC_AUTH');

const models = require(__base + 'models');

const _ = require('lodash');
const indicative = require('indicative');

async function confirm(req, res, next) {
  debug('Enter confirm method!');
  const rules = {
    email: 'required|email'
  };

  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {where:{}};

  if (!_.isUndefined(input.email)) {
    filter.where = {
      email: input.email
    };
  }
  filter.attributes = ['id','email'];
  try {
    let user = await models.User.findOne(filter);
    let enterprise = await models.Enterprise.findOne(filter);

    if(user === null && enterprise === null) throw new MainError('common', 'notFound');

    return res.return();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  confirm
};
