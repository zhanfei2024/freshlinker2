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

'use strict';
const debug = require('debug')('APP:MIGRATE');
const models = require('../models');

/**
 * =======
 * Command
 * =======
 *
 * update database: [create tables and columns if not exists]
 * [should not set column allowNull to false because there may be existing rows]
 * - node bin/migrate
 * - node bin/migrate update
 *
 * reset database: [drop all tables and re-create them]
 * - node bin/migrate reset
 *
 */

/**
 * Module dependencies.
 */
let Migrate = module.exports = {};

Migrate.reset = async function() {
  debug('START INIT DATABASE!');
  try {
    // database reset
    await models.sequelize.sync({force: 1});
    //在User表中手动添加与masterUserId的索引.
    await Promise.all([
      await models.JobNature.initSeed(),
      await models.Currency.initSeed(),
      await models.Country.initSeed(),
      await models.Admin.initSeed(),
      await models.CandidateStatus.initSeed(),
      await models.Language.initSeed(),
      await models.AuthenticationProviderType.initSeed(),
      await models.EducationLevel.initSeed(),
      await models.Plan.initSeed(),
      await models.Setting.initSeed(),
    ]);
    debug('Database has been reset!');
  } catch (err) {
    debug(`VALUE ERROR: %j`, err);
  }

  process.exit();
};

Migrate.update = async function() {
  process.exit();
};

function _dubug(err) {
  debug(err.toString());
}

(function () {
  let action = process.argv[2] ? process.argv[2] : 'reset';
  debug('migrate action: ' + action);
  if (!Migrate[action]) {
    debug('no such action!');
    process.exit();
  }

  Migrate[action]();
})();
