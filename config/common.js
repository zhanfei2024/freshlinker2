'use strict';

/**
 * common Config
 * @module Config
 */
let Config = module.exports = {};

Config.baseUrl = process.env.BASEURL || 'http://localhost:3000';
Config.sourceUrl = process.env.SOURCEURL || 'http://localhost:3000';
Config.apiPath = '/api/v1';
Config.systemName = 'FreshLinker';
Config.systemEmail = 'no-reply@freshlinker.com';

Config.siteTitle = 'FreshLinker';
Config.email = {
  support: 'support@freshlinker.com',
  noreply: 'no-reply@freshlinker.com',
  cs: 'cs@freshlinker.com',
};
Config.systemEmail = 'no-reply@freshlinker.com';

