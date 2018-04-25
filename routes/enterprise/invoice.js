'use strict';

// core
const debug = require('debug')('APP:INVOICE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const stripeMethod = require(__base + 'methods/stripe');
const moment = require('moment');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  const rules = {
    startedDate: 'date',
    endedDate: 'date',
  };

  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);
  filter.customer = res.locals.enterpriseAuth.paymentAccountId;
  filter.created = {};
  filter.source = {
    object: 'card'
  };

  if (!_.isUndefined(input.startedDate)) filter.created.gte = moment.utc(input.startedDate).format('x').substring(0, 10);
  if (!_.isUndefined(input.endedDate)) filter.created.lte = moment.utc(input.endedDate).format('x').substring(0, 10);

  try {
    let result = await stripeMethod.gateway.charges.list(filter);

    return res.paginator(result.data, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);

  try {
    let result = await stripeMethod.gateway.charges.retrieve(req.params.invoiceId);
    if (result.customer !== res.locals.enterpriseAuth.paymentAccountId) throw new MainError('common', 'notFound');

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {

};

Route.update = async function(req, res, next) {

};

Route.destroy = async function(req, res, next) {

};
