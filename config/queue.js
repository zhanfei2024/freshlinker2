'use strict';

/**
 * queue Config
 * @module Config
 */
let Config = module.exports = {};

/**
 |--------------------------------------------------------------------------
 | Default Queue Driver
 |--------------------------------------------------------------------------
 |
 | Supported: "sync", "redis"
 |
 */
Config.default = process.env.QUEUE_DRIVER || 'redis';

/**
 |--------------------------------------------------------------------------
 | Queue Connections
 |--------------------------------------------------------------------------
 |
 */
Config.connections = {
  redis: {
    prefix: process.env.QUEUE_REDIS_PREFIX || 'q',
    host: process.env.QUEUE_REDIS_HOST || '127.0.0.1',
    port: process.env.QUEUE_REDIS_PORT || 6379,
  },
  mongo: {
    prefix: process.env.QUEUE_MONGO_PREFIX || 'q',
    host: process.env.QUEUE_MONGO_HOST || '127.0.0.1',
    port: process.env.QUEUE_MONGO_PORT || 27017,
  }
};
