'use strict';

// core
const debug = require('debug')('APP:USER_AUTH');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.isActivated = async function(req, res, next) {
  return res.item({
    isActivated: (res.locals.authProvider !== null && res.locals.authProvider.userId !== null)
  });
};

Route.activate = async function(req, res, next) {
  const rules = {
    email: 'string|min:6',
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

    let user = await models.User.create(input, {
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
      userId: user.id,
      authenticationProviderTypeId: authProviderType.id
    }, {
      transaction: t
    });

    await t.commit();

    return res.item(user);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};
