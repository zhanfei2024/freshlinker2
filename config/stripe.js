'use strict';

/**
 * stripe Config
 * @module Config
 */
let Config = module.exports = {};

Config.stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'tokenthere';
