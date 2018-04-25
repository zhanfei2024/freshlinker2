'use strict';

/**
 * filesystem Config
 * @module Config
 */
let Config = module.exports = {};

Config.key = process.env.S3_KEY || 'S3_KEY';
Config.endpoint = process.env.S3_ENDPOINT || 'S3_ENDPOINT';
Config.secret = process.env.S3_SECRET || 'S3_SECRET';
Config.region = process.env.S3_REGION || 'S3_REGION';
Config.bucket = process.env.S3_BUCKET || 'S3_BUCKET';
if (process.env.S3_PORT) Config.port = process.env.S3_PORT;
Config.style = 'path';
