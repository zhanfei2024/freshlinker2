'use strict';

// core
const debug = require('debug')('APP:USER_JWT_AUTH_MIDDLEWARE');

// model
const models = require(__base + 'models');

module.exports = async function(req, res, next) {
  debug(`ENTER AUTH METHOD!`);

  try {
    let authProvider = res.locals.authProvider;

    if (authProvider === null || authProvider.userId === null) throw new MainError('auth', 'doNotHaveAccount');
    debug(`CHECK authProvider exists!`);

    res.locals.userAuth = await models.User.findById(authProvider.userId);

    return next();
  } catch (err) {
    return next(err);
  }
};
