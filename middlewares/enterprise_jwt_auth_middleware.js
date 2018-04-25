'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_JWT_AUTH_MIDDLEWARE');

// model
const models = require(__base + 'models');

module.exports = async function(req, res, next) {
  debug(`ENTER AUTH METHOD!`);

  try {
    let authProvider = res.locals.authProvider;

    if (authProvider === null || authProvider.enterpriseId === null) throw new MainError('auth', 'doNotHaveAccount');
    debug(`CHECK authProvider exists!`);

    let enterprise = await models.Enterprise.scope(['includeCompanies']).findById(authProvider.enterpriseId);
    res.locals.companyIds = enterprise.companies.map((val) => {
      return val.id;
    });
    res.locals.enterpriseAuth = enterprise;

    return next();
  } catch (err) {
    return next(err);
  }
};
