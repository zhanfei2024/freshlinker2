'use strict';

// core
const debug = require('debug')('APP:JWT_AUTH_MIDDLEWARE');

// model
const models = require(__base + 'models');
const _ = require('lodash');
const authConfig = require(__base + 'config/auth');

 // jwt
 // const jwt = require('jsonwebtoken');

//  module.exports = async function (req, res, next) {
//   debug(`ENTER AUTH METHOD!`);
//
//   // get token
//   let token = null;
//   if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.query && req.query.token) {
//     token = req.query.token;
//   }
//
//   try {
//     if (token === null) throw new MainError('auth', 'invalidJWT');
//
//     let decoded = jwt.verify(token, new Buffer(authConfig.secret, 'base64'), {
//       audience: authConfig.clientId
//     });
//
//     let sub = decoded.sub.split('|');
//     let subId = sub[1];
//     let subType = sub[0];
//     if (!_.includes(['yoov', 'facebook', 'google', 'twitter', 'weibo'], subType)) subType = 'yoov';
//
//     let authProvider = await models.AuthenticationProvider.findOne({
//       where: {
//         id: subId,
//       },
//       include: [{
//         model: models.AuthenticationProviderType,
//         as: 'type',
//         where: {
//           code: subType
//         },
//         required: true
//       }]
//     });
//
//     res.locals.jwt = [subType, subId];
//     res.locals.authProvider = authProvider;
//     return next();
//   } catch (err) {
//     debug(`ERROR: %j`, err);
//     return next(err);
//   }
// };

 // jwt
 const jwt = require('express-jwt');
 const jwksRsa = require('jwks-rsa');

 let checkProvider = async function(req, res, next) {
  debug('ENTER checkProvider METHOD!');

  try {
    const decoded = req.user;
    const sub = decoded.sub.split('|');
    const subId = sub[1];
    let subType = sub[0];
    if (!_.includes(['yoov', 'facebook', 'google', 'twitter', 'weibo'], subType)) subType = 'yoov';

    let authProvider = await models.AuthenticationProvider.findOne({
      where: {
        id: subId,
      },
      include: [{
        model: models.AuthenticationProviderType,
        as: 'type',
        where: {
          code: subType,
        },
        required: true,
      }],
    });
    res.locals.jwt = [subType, subId];
    res.locals.authProvider = authProvider;

    return next();
  } catch (err) {
    debug('ERROR: %j', err);
    return next(err);
  }
};


 module.exports = {
  jwt: jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${authConfig.issuer}.well-known/jwks.json`,
    }),
    audience: authConfig.clientId,
    issuer: authConfig.issuer,
    algorithms: ['RS256'],
  }),
  checkProvider,
};
