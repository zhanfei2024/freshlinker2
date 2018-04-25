'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_CARD');

// library
const _ = require('lodash');
const indicative = require('indicative');
const stripeMethod = require(__base + 'methods/stripe');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  try {
    let result = await stripeMethod.gateway.customers.listCards(res.locals.enterpriseAuth.paymentAccountId);
    let customer = await stripeMethod.gateway.customers.retrieve(res.locals.enterpriseAuth.paymentAccountId);

    if (customer.default_source !== null) {
      _.each(result.data, function (val, index) {
        result.data[index].default_source = val.id === customer.default_source;
      });
    }
    return res.collection(result.data);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug('Enter show method!');

  try {
    let result = await stripeMethod.gateway.customers.retrieveCard(
      res.locals.enterpriseAuth.paymentAccountId,
      req.params.cardId);

    // define default source
    let customer = await stripeMethod.gateway.customers.retrieve(res.locals.enterpriseAuth.paymentAccountId);
    result.default_source = customer.default_source === result.id;

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.create = async function(req, res, next) {
  debug('Enter create method!');

  const rules = {
    paymentToken: 'required|min:1',
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let result = await stripeMethod.gateway.customers.listCards(res.locals.enterpriseAuth.paymentAccountId);
    if (result.data.length >= 5) throw new MainError('ab', 'a');

    result = await stripeMethod.gateway.customers.createSource(res.locals.enterpriseAuth.paymentAccountId, {
      source: input.paymentToken
    });

    req.params.cardId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    return next(err);
  }
};

Route.setDefault = async function(req, res, next) {
  debug('Enter setDefault method!');

  try {
    await stripeMethod.gateway.customers.retrieveCard(
      res.locals.enterpriseAuth.paymentAccountId,
      req.params.cardId);

    await stripeMethod.gateway.customers.update(
      res.locals.enterpriseAuth.paymentAccountId, {
        default_source: req.params.cardId
      });

    return res.return();
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function (req, res, next) {
  debug('Enter destroy method!');

  try {
    let result = await stripeMethod.gateway.customers.deleteCard(
      res.locals.enterpriseAuth.paymentAccountId,
      req.params.cardId);

    if (result.deleted !== true) throw new MainError('common', 'notFound');

    return res.return();
  } catch (err) {
    return next(err);
  }
};

