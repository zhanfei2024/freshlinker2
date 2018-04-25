'use strict';

/**
 * mail Config
 * @module Config
 */
let Config = module.exports = {};

Config.host = process.env.MAIL_HOST || 'host';
Config.port = process.env.MAIL_PORT || 'port';
Config.secure = process.env.MAIL_SECURE === 'true' || false;
Config.auth = {
  user: process.env.MAIL_AUTH_USER || 'username',
  pass: process.env.MAIL_AUTH_PASS || 'password'
};
