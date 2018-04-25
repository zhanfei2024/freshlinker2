'use strict';

// core
const debug = require('debug')('APP:PLANS');


// model
const models = require(__base + 'models');

const stripeConfig = require(__base + 'config/stripe');

let stripe = require('stripe')(stripeConfig.stripeSecretKey);

/**
 * Method
 * @module Method
 */
let Method = module.exports = {};

Method.gateway = stripe;

