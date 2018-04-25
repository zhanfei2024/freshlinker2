'use strict';

/**
 * AUTH Config
 * @module Config
 */
let Config = module.exports = {};

Config.secret = process.env.AUTH_SECRET || 'tokenthere';
Config.clientId = process.env.AUTH_CLIENT_ID || 'tokenthere';
Config.issuer = process.env.AUTH_ISSUER || 'tokenthere';
