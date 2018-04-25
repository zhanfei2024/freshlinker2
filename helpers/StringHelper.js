'use strict';
const debug = require('debug')('APP:STRING_HELPER');
const _ = require('lodash');

let Helper = module.exports = {};

/**
 * @description slugify
 * @method slugify
 * @param  {String} text
 * @return {String}
 * @public
 */
Helper.slugify = function (text) {
  return text.toString().trim()
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[\s]+/g, '-')      // Replace spaces, non-word characters and dashes with a single dash (-)
};
