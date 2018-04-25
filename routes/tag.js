'use strict';

// core
const debug = require('debug')('APP:TAG');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug(`ENTER index method!`);
  const rules = {
    search: 'min:1',
    type: 'min:1'
  };
  let input = validateHelper.pick(req.query, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);
  let scopes = [];

  if (!_.isUndefined(input.search) && input.search !== '') {
    filter.where.$or = {
      slug: {
        $iLike: '%' + input.search + '%'
      }
    };
  }

  if (input.type === 'PostTag') {
    scopes.push('includePost');
  }
  if (input.type === 'PositionSkill') {
    scopes.push('includePosition');
  }

  filter.order = [['count', 'DESC']];
  try {
    let result = await models.Tag.scope(scopes).findAndCountAll(filter);

    res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    next(err);
  }

};

