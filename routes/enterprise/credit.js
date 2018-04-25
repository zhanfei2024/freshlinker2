'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_CREDIT');

// model
const models = require(__base + 'models');

// library
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const stripeMethod = require(__base + 'methods/stripe');

let Route = module.exports = {};

/**
 * 充值
 *
 */
Route.deposit = async function(req, res, next) {
  debug(`ENTER create method!`);

  const rules = {
    amount: 'required|min:1|integer'
  };

  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    // adjustment balance
    let enterprise = await models.Enterprise.findOne({
      where: {
        id: res.locals.enterpriseAuth.id
      },
      transaction: t
    });
    await enterprise.increment({balance: input.amount}, {
      transaction: t
    });

    // Create a charge: this will charge the user's card
    await stripeMethod.gateway.charges.create({
      customer: res.locals.enterpriseAuth.paymentAccountId,
      amount: (input.amount * 100), // amount in cents
      currency: 'hkd',
      description: 'Credit'
    });

    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();

    if (err && err.type === 'StripeCardError') {
      // The card has been declined
      if (err.rawType === 'card_error') return next(new MainError('payment', 'invalidCard'));
      return next(new MainError('payment', 'invalidPayment'));
    }

    return next(err);
  }
};

