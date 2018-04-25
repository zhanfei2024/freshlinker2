'use strict';

// core
const debug = require('debug')('APP:ADMIN_JWT_AUTH_MIDDLEWARE');

// model
const models = require(__base + 'models');
const moment = require('moment');

// jwt
const jwt = require('jsonwebtoken');
const jwtConfig = require(__base + 'config/auth');

module.exports = async function(req, res, next) {
  debug(`ENTER ADMIN AUTH METHOD!`);
  try {
    // get token
    let token = null;
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.body && req.body.token) {
      token = req.body.token;
    }
    if (token === null) throw new MainError('auth', 'invalidJWT');

    let session = null;
    let decoded = jwt.verify(token, jwtConfig.secret);
    if (decoded.type === 'admin') {
      session = await models.AdminSession.findOne({
        where: {
          adminId: decoded.adminId,
          token: decoded.jti
        }
      });
      if (session === null) throw new MainError('auth', 'invalidJWT');
      await session.updateAttributes({
        lastUsedAt: moment.utc().toISOString()
      });

      res.locals.adminAuth = await models.Admin.findById(decoded.adminId);
    }
    res.locals.session = session;
    return next();
  } catch (err) {
    return next(err);
  }
};
