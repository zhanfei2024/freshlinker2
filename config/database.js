'use strict';

/**
 * DATABASE Config
 * @module Config
 */
let Config = module.exports = {};

Config.username = process.env.DB_USERNAME || 'homestead';
Config.password = process.env.DB_PASSWORD || 'secret';
Config.database = process.env.DB_DATABASE || 'homestead';
Config.host = process.env.DB_HOST || '127.0.0.1';
Config.port = process.env.DB_PORT || '54320';
Config.dialect = process.env.DB_DIALECT || 'postgres';
