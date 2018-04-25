'use strict';

// core
const debug = require('debug')('APP:JOBS');
const logger = require(__base + 'modules/logger');

// config
const queueConfig = require(__base + 'config/queue');

// model

// library
const kue = require('kue');

let queue = kue.createQueue({
  prefix: queueConfig.connections.redis.prefix,
  redis: {
    port: queueConfig.connections.redis.port,
    host: queueConfig.connections.redis.host,
    db: 3,
    options: {}
  }
});

/**
 * Method
 * @module Method
 */
let Method = module.exports = {};


/**
 * @description create queue
 * @method create
 * @param  {String} type
 * @param  {Object} data
 * @param  {String} priority
 * @param  {Number} attempts
 * @return {Promise}
 * @public
 */
Method.queue = queue;

/**
 * @description create queue
 * @method create
 * @param  {String} type
 * @param  {Object} data
 * @param  {String} priority
 * @param  {Number} attempts
 * @return {Promise}
 * @public
 */
Method.create = function (type, data, priority, attempts) {
  attempts = attempts || 1;
  priority = priority || 'normal';
  logger.log('info', `added ${type} queue!`);
  return new Promise(function (resolve, reject) {
    queue.create(type, data).priority(priority).attempts(attempts).save(function (err) {
      if (err) return reject(err);
      return resolve();
    });
  });
};
