#!/usr/bin/env node

// ***************************************
// CORE INIT BEGIN
// ***************************************
// path setup
global.__base = __dirname + '/../';

// Config Init
let envPath = '.env';
if (process.env.NODE_ENV !== 'production')
  envPath = `.env.${process.env.NODE_ENV || 'development'}`;

require('dotenv').config({
  path: envPath
});

// ***************************************
// CORE INIT END
// ***************************************

// jwt
const  jwt = require('jsonwebtoken');
const authConfig = require(`${__base}config/auth`);

(async function () {
  try {
    console.log('Bearer ' + jwt.sign({sub: `auth0|1`}, new Buffer(authConfig.secret, 'base64'), {
        audience: authConfig.clientId
      }));
  } catch (err) {
    console.log(err);
  }
})();
