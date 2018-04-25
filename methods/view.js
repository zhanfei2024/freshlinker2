'use strict';

// core
const debug = require('debug')('APP:VIEW_METHOD');
const logger = require(__base + 'modules/logger');

// config

// model

// library
const fs = require('fs');
const juice = require('juice');

const handlebarsLayouts = require('handlebars-layouts');
let hbs = require('hbs');
hbs.registerPartials(__dirname + '/../views');
hbs.registerHelper(handlebarsLayouts(hbs.handlebars));

let Method = module.exports = {};
/**
 * @description Render view
 * @method complie
 * @param {String} path of file
 * @param {Object} compile with data
 * @return {Promise}
 * @public
 */
Method.compile = async function(path, data) {
  data = data || {};
  try {
    let source = await fs.readFileSync(__base + 'views/' + path);
    let template = hbs.handlebars.compile(source.toString())(data);
    return Promise.resolve(template);
  } catch (err) {
    return Promise.reject(err);
  }
};
/**
 * @description Render view with css inline function
 * @method inlineCssComplie
 * @param {String} path of file
 * @param {Object} compile with data
 * @return {Promise}
 * @public
 */
Method.inlineCssCompile = async function(path, data) {
  data = data || {};
  try {
    let source = await Method.compile(path, data);
    return Promise.resolve(juice(source));
  } catch (err) {
    return Promise.reject(err);
  }
};
