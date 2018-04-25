'use strict';

// core
const debug = require('debug')('APP:POSITION_METHOD');
const logger = require(__base + 'modules/logger');

// model
const models = require(__base + 'models');

// library
const moment = require('moment');
const _ = require('lodash');

/**
 * Method
 * @module Method
 */
let Method = module.exports = {};

/**
 * return per capita cost.
 * @type {Function}
 */
Method.perCapitaCost = function (positionId, filter) {
  return new Promise(async function(resolve, reject) {
    try {
      _.forEach(filter, function (val) {
        if (!_.isUndefined(val.type)) {
          let index = _.findIndex(filter, function (o) {
            return o.type === val.type;
          });
          switch (val.type) {
            case 'education':
              let arr = _.omitBy(val, function (value) {
                return value === '' || value === null;
              });
              let size = Object.keys(_.omit(arr, ['name', 'type', 'price'])).length;
              filter[index].price = 8 * size;
              break;
            case 'location':
              filter[index].price = 8;
              break;
            case 'skill':
              // let arrLength = 0;
              // if (!_.isNull(val.value)) arrLength = val.value.split(',').length;
              // if (arrLength <= 3) {
              //   filter[index].price = arrLength * 8;
              // } else {
              //   throw new MainError('invitation', 'maxLimit');
              // }
              filter[index].price = 8;
              break;
            case 'experience':
              filter[index].price = 8;
              break;
            case 'languages':
              filter[index].price = val.value.length * 8;
              break;
            case 'salary':
              filter[index].price = 8;
              break;
          }
        }
      });

      return resolve(filter);
    } catch (err) {
      return reject(err);
    }
  });
};

/**
 * return per capita cost.
 * @type {Function}
 */
Method.cost = async function(positionId, filter) {
  let totalPrice = 0;
  if (_.isUndefined(filter) || _.isUndefined(positionId)) {
    totalPrice = 0;
  } else {
    let data = await Method.perCapitaCost(positionId, filter);
    _.forEach(data, function (val) {
      totalPrice += val.price;
    });
  }
  return totalPrice;
};
