'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_AUTH');

// model
const models = require(__base + 'models');

// library
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const stripeMethod = require(__base + 'methods/stripe');

let Route = module.exports = {};

Route.isActivated = async function (req,res,next) {
  debug('Enter isActivated method!');

  return res.item({
    isActivated:(res.locals.authProvider !== null && res.locals.authProvider.enterpriseId !== null)
  });
};
Route.activate = async function(req, res, next) {
  debug('Enter active method!');

  const rules = {
    email: 'email|min:6',
    lastName: 'min:1',
    firstName: 'min:1',
  };
  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    if (res.locals.authProvider !== null) {
      if (res.locals.authProvider.userId !== null || res.locals.authProvider.enterpriseId !== null) throw new MainError('common', 'notFound');
    }

    let stripe = await stripeMethod.gateway.customers.create({
      email: input.email
    });
    
    input.paymentAccountId = stripe.id;
    let enterprise = await models.Enterprise.create(input, {
      transaction: t
    });

    let authProviderType = await models.AuthenticationProviderType.findOne({
      where: {
        code: res.locals.jwt[0]
      },
      transaction: t
    });

    await models.AuthenticationProvider.create({
      id: res.locals.jwt[1],
      enterpriseId: enterprise.id,
      authenticationProviderTypeId: authProviderType.id
    }, {
      transaction: t
    });

    await t.commit();

    return res.item(enterprise);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};
