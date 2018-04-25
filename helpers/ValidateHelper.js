'use strict';
const debug = require('debug')('APP:VALIDATE_HELPER');
const _ = require('lodash');
const indicative = require('indicative');
const models = require(__base + 'models');
const Parser = require('./ValidateRuleParser');

const gm = require('gm');
/**
 * @description figures out whether value can be skipped
 * or not from validation, as non-existing values
 * should be validated using required.
 * @method skippable
 * @param  {Mixed}  value
 * @return {Boolean}
 * @private
 */
const skippable = function (value) {
  return !indicative.is.existy(value) && value !== null
};

let Helper = module.exports = {};

/**
 * @description enforces to pick input by filter
 * @method pick
 * @param  {Object} input,  data source
 * @param  {String} rules, rules for validation
 * @param  {Array} exclude, field list should be exclude
 * @param  {Array} include, field list should be include
 * @return {Object}
 * @public
 */
Helper.pick = function (input, rules, exclude, include) {
  include = include || [];
  exclude = exclude || [];
  rules = rules || [];

  let result = Helper.attributeParseType(input, rules);
  result = _.pick(result, exclude.length > 0 ? Object.keys(_.omit(rules, exclude)) : Object.keys(rules));

  return _.pickBy(result, (val, key) => {
    return !skippable(val) || include.indexOf(key) !== -1
  });
};

/**
 * Attribute Parse Type
 * @description force change `input` value type from `rules`
 */
Helper.attributeParseType = function (input, rules) {
  let transformedRules = Parser.transformRules(input, rules);
  _.each(transformedRules, function (rule, key) {
    let ruleNameList = _.map(rule, 'name');
    if (!skippable(_.get(input, key))) {
      if (ruleNameList.indexOf('integer') !== -1) _.set(input, key, parseInt(_.get(input, key)));
      if (ruleNameList.indexOf('boolean') !== -1) _.set(input, key, indicative.sanitizor.toBoolean(_.get(input, key)));
    }
  });
  return input;
};

/**
 * Attribute Parse Type
 * @description force change `input` value type from `rules`
 */
Helper.emptyAttributeHandler = function (input, attributeNeedToDelete, attributeNeedToNull) {
  _.each(attributeNeedToDelete, function (val, index) {
    if (input[val] === '') delete input[val];
  });
  _.each(attributeNeedToNull, function (val, index) {
    if (input[val] === '') input[val] = null;
  });
  return input;
};

/**
 *
 * Read Attribute Filter
 * @description for filter field output by ACL system
 */
Helper.readAttributeFilter = function (value, accessList, mainValue) {
  if (_.isString(value)) value = _.compact(value.split(','));
  if (!_.isArray(value)) return accessList;

  let attributes = value.length > 0 ? _.filter(value, function (val) {
    return _.includes(accessList, val);
  }) : accessList;

  _.each(mainValue, function (val) {
    if (attributes.indexOf(val) === -1) attributes.push(val);
  });

  return attributes.length > 0 ? attributes : accessList;
};

/**
 *
 * Edit Attribute Filter
 * @description for filter field output by ACL system
 */
Helper.editAttributeFilter = function (value, accessList, mainValue) {
  let attributes = _.pick(value, accessList);
  _.each(mainValue, function (val) {
    if (!_.has(attributes, val)) attributes[val] = value[val];
  });
  return attributes;
};

/**
 * Paginator Helper
 * @description init page & limit
 */
Helper.paginatorHelper = {
  initFilter: function (data) {
    return new Promise(async function(resolve) {
      const rules = {
        ids: 'array',
        limit: 'integer|range:0,201',
        page: 'integer|range:0,201',
      };
      let input = Helper.pick(data, rules);

      try {
        await indicative.validate(input, rules, Helper.message);
      } catch (err) {
        input = {};
      }
      let filter = {
        limit: input.limit ? input.limit : 50,
        where: {}
      };
      filter.offset = input.page ? ((input.page - 1) * filter.limit) : 0;

      if (input.ids) filter.where.id = {$in: input.ids};

      return resolve(filter);
    });
  }
};

/**
 * Message for validation
 * @description
 */
Helper.message = {
  in: 'The selected {{field}} is invalid',
  exists: 'The selected {{field}} is invalid',
  array: 'The {{field}} must be an array.',
  integer: 'The {{field}} must be an integer.',
  boolean: 'The {{field}} field must be true or false.',
  date: 'The {{field}} is not a valid date.',
  email: 'The {{field}} must be a valid email address.',
  alpha: 'The {{field}} may only contain letters.',
  alpha_num: 'The {{field}} may only contain letters and numbers.',
  ip: 'The {{field}} must be a valid IP address.',
  before: 'The {{field}} must be a date before {{argument.0}}.',
  after: 'The {{field}} must be a date after {{argument.0}}.',
  min: 'The {{field}} must be at least {{argument.0}} characters.',
  max: 'The {{field}} may not be greater than {{argument.0}} characters.',
  requiredIfEmpty: 'The {{field}} field is required.',
  required: 'The {{field}} field is required.',
  numeric: 'The {{field}} field must be numeric.',
  image: 'The {{field}} field must be an image.',
  dimensions: 'The {{field}} has invalid image dimensions.',
};

/**
 *
 *
 * extra validation method
 * @description
 */
Helper.extend = {
  image: function (data, field, message, args, get) {
    return new Promise(function (resolve, reject) {
      const fieldValue = get(data, field);
      if (skippable(fieldValue)) {
        resolve('validation skipped');
        return;
      }
      if (['image/jpeg', 'image/png'].indexOf(fieldValue.mimetype) !== -1) {
        resolve('validation passed');
        return;
      }
      reject(message);
    });
  },
  dimensions: function (data, field, message, args, get) {
    return new Promise(function (resolve, reject) {
      const fieldValue = get(data, field);
      if (skippable(fieldValue)) {
        resolve('validation skipped');
        return;
      }

      gm(fieldValue.path).identify(function (err, data) {
        if (err) return reject(message);

        let parameters = {};
        _.each(args, (arg)=> {
          let argValue = arg.split('=');
          parameters[argValue[0]] = argValue[1];
        });

        if (
          !_.isUndefined(parameters.width) && parseInt(parameters.width) !== data.size.width ||
          !_.isUndefined(parameters.min_width) && parseInt(parameters.min_width) > data.size.width ||
          !_.isUndefined(parameters.max_width) && parseInt(parameters.max_width) < data.size.width ||
          !_.isUndefined(parameters.height) && parseInt(parameters.height) !== data.size.height ||
          !_.isUndefined(parameters.min_height) && parseInt(parameters.min_height) > data.size.height ||
          !_.isUndefined(parameters.max_height) && parseInt(parameters.max_height) < data.size.height
        ) {
          return reject(message);
        }

        if (!_.isUndefined(parameters.ratio)) {
          let ratio = parameters.ratio.split('/');

          let numerator = !_.isUndefined(ratio[0]) && ratio[0] !== '' ? parseInt(ratio[0]) : 1;
          let denominator = !_.isUndefined(ratio[0]) && ratio[1] !== '' ? parseInt(ratio[1]) : 1;
          if (numerator / denominator !== data.size.width / data.size.height) return reject(message);
        }

        resolve('validation passed');
        return;
      });
    });
  },
  numeric: function (data, field, message, args, get) {
    return new Promise(function (resolve, reject) {
      const fieldValue = get(data, field);
      if (skippable(fieldValue)) {
        resolve('validation skipped');
        return;
      }
      if (indicative.is.number(fieldValue)) {
        resolve('validation passed');
        return;
      }
      reject(message);
    });
  },
  /**
   * @description enforces a field to not be empty if present
   * @method requiredIfEmpty
   * @param  {Object} data
   * @param  {String} field
   * @param  {String} message
   * @param  {Array} args
   * @param  {Function} get
   * @return {Object}
   * @public
   */
  requiredIfEmpty: function (data, field, message, args, get) {
    return new Promise(function (resolve, reject) {
      const fieldValue = get(data, field);
      if (typeof fieldValue === 'undefined' || !skippable(fieldValue)) {
        resolve('validation passed');
        return;
      }

      reject(message);
    })
  },
  /**
   example:
   1. basic
   'exists:tableName,fieldName,whereField,whereValue'
   */
  exists: function (data, field, message, args, get) {
    return new Promise(function (resolve, reject) {
      // get value of field under validation
      const fieldValue = get(data, field);

      // resolve if value does not exists, value existence
      // should be taken care by required rule.
      if (!fieldValue) return resolve('validation skipped');

      let where = {
        [args[1]]: fieldValue
      };
      let i;
      for (i = 2; i < args.length; i += 2) {
        if (typeof args[i + 1] !== 'undefined') where[args[i]] = args[i + 1];
      }
      models[args[0]].findOne({
        where: where
      }).then(function (result) {
        if (result === null) {
          reject(message)
        } else {
          resolve('data exists');
        }
      }).catch(resolve);
    });
  },
  /**
   example:
   1. basic
   'unique:tableName,fieldName'
   2. Forcing A Unique Rule To Ignore A Given ID
   'unique:tableName,fieldName,ignoreField, ignoreValue'
   */
  unique: function (data, field, message, args, get) {
    return new Promise(function (resolve, reject) {
      // get value of field under validation
      const fieldValue = get(data, field);

      // resolve if value does not exists, value existence
      // should be taken care by required rule.
      if (!fieldValue) return resolve('validation skipped');

      let where = {
        [args[1]]: fieldValue,
        [args[2]]: {
          $ne: args[3]
        }
      };
      let i;
      for (i = 4; i < args.length; i += 2) {
        if (typeof args[i + 1] !== 'undefined') where[args[i]] = args[i + 1];
      }
      models[args[0]].findOne({
        where: where
      }).then(function (result) {
        if (result === null) {
          reject(message)
        } else {
          resolve('data exists');
        }
      }).catch(resolve);
    });
  }
};
