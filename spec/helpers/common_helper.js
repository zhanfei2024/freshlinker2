// jwt
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const authConfig = require(`${__base}config/auth`);
const fs = require('fs');
const commonHelper = module.exports = {};

commonHelper.getSiteUrl = function () {
  return 'http://127.0.0.1:7777/api/v1';
};

commonHelper.getEnterpriseAPIUrl = function () {
  return commonHelper.getSiteUrl() + '/enterprise';
};

commonHelper.getUserAPIUrl = function () {
  return commonHelper.getSiteUrl() + '/user';
};

commonHelper.getPublicAPIUrl = function () {
  return commonHelper.getSiteUrl() + '/public';
};

commonHelper.getAdminAPIUrl = function () {
  return commonHelper.getSiteUrl() + '/admin';
};

commonHelper.getUserLoginTokenById = function (id) {
  const token = jwt.sign({ sub: `auth0|${id}` }, global.auth0TokenPair.private, {
    algorithm: 'RS256',
    header: { kid: authConfig.clientId },
    audience: authConfig.clientId,
    issuer: authConfig.issuer,
  });
  return `Bearer ${token}`;
};

commonHelper.getOwnerLoginToken = function () {
  return global.token;
};

module.exports = commonHelper;
