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


// core
const debug = require('debug')('APP:QUEUE_BOOTSTRAP');
const logger = require(__base + 'modules/logger');

// library
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const CronJob = require('cron').CronJob;

const basename = path.basename(module.filename);
const taskPath = `${__base}/cron/task`;

fs
  .readdirSync(taskPath)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function (file) {
    if (file.slice(-3) !== '.js') return;
    debug(file);
    require(path.join(taskPath, file))(CronJob);
  });

logger.log('info', `Worker started, Listening on: 4444`);

