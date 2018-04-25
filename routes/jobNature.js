'use strict';

// core
const debug = require('debug')('APP:JOB_NATURE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  const rules = {
    search: 'min:1',
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);
  if (!_.isUndefined(input.search) && input.search !== '') {
    filter.where.$or = {
      name: {
        $iLike: '%' + input.search + '%'
      }
    };
  }

  filter.order = [['updatedAt', 'DESC']];
  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.JobNature.getAttributes(), ['updatedAt']);
  try {
    let result = await models.JobNature.findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  debug(`ENTER show method!`);

  let filter = {
    where: {
      id: req.params.jobNatureId
    }
  };

  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.JobNature.getAttributes(), ['updatedAt']);
  try {
    let result = await models.JobNature.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};
