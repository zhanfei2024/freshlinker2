'use strict';

const debug = require('debug')('APP:PRESENT');
const _ = require('lodash');

let defaultOptions = {
  errorDir: ''
};
/**
 * Adds output methods to response object via express middleware
 *
 * @method presenter
 * @param  {object}         options
 * @return {function}       middleware
 */
let presenter = function (options) {
  options = _.extend(defaultOptions, options) || defaultOptions;
  return function (req, res, next) {
    res.return = function (params) {
      res.json(_.assign({status: true}, params));
    };
    res.item = function (result, params) {
      res.json(_.assign({status: true}, {result: result === null ? {} : result}, params));
    };
    res.collection = function (result, params) {
      res.json(_.assign({status: true}, {result: result === null ? [] : result}, params));
    };
    res.paginator = function (result, params, filter) {
      let nextPageSize = 2;
      let offsetLimit = filter.offset / filter.limit;
      if (result.length < filter.limit) nextPageSize = 1;
      res.json(_.assign({status: true}, {
        meta: {
          pagination: {
            count: result.length,
            currentPage: offsetLimit + 1,
            nextPage: offsetLimit + nextPageSize,
            prevPage: Math.max(req.query.page - 1, 1)
          }
        },
        result: result === null ? [] : result
      }, params));
    };
    res.paginatorWithCount = function (result, params, filter) {
      let offsetLimit = filter.offset / filter.limit;
      let totalOffset = filter.limit + filter.offset;

      res.json(_.assign({status: true}, {
        meta: {
          pagination: {
            totalCount: result.count,
            totalPage: Math.ceil(result.count/filter.limit),
            count: result.rows.length,
            currentPage: offsetLimit + 1,
            nextPage: (totalOffset < result.count || result.rows.length > filter.limit) ?(offsetLimit + 2): null,
            prevPage: (offsetLimit > 0 && Math.ceil(result.count/filter.limit) > offsetLimit ) ? (req.query.page - 1) : null,
          }
        },
        result: result.rows
      }, params));
    };
    res.error = function (errorFileName, name, params) {
      let error = require(options.errorDir + errorFileName + '.json')[name];
      return res.status(error.statusCode).json({
        status: false,
        code: error.code || 400,
        message: req.__(error.message, (params || []))
      });
    };
    res.customError = function (name, params) {
      return res.status(400).json({
        status: false,
        message: req.__(name, (params || []))
      });
    };
    res.validateError2 = function (errors) {
      debug('ERROR validateError2: %j', errors);
      if (_.isArray(errors)) {
        let field = errors[0]['field'];
        field = field.slice(0, _.indexOf(field, '.'));
        return res.status(400).json({
          status: false,
          field: field,
          validation: errors[0]['validation'],
          message: errors[0]['message']
        });
      }
      return res.status(400).json({
        status: false,
        message: 'Bad Request'
      });
    };
    res.validateError = function (errors) {
      return res.status(400).json({
        status: false,
        message: errors[0]['msg']
      });
    };
    next();
  };
};

module.exports = presenter;
