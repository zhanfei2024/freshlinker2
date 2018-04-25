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
const kue = require('kue');

const jobs = require(__base + 'jobs');

const queue = jobs.queue;

const basename = path.basename(module.filename);
const taskPath = `${__base}/jobs/task`;

queue.setMaxListeners(20);
fs
  .readdirSync(taskPath)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function (file) {
    if (file.slice(-3) !== '.js') return;
    require(path.join(taskPath, file))(queue);
  });

logger.log('info', `Queue started, Listening on: 5555`);
kue.app.listen(5555);
