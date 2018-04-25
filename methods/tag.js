'use strict';

// core
const debug = require('debug')('APP:TAG_METHOD');
const logger = require(__base + 'modules/logger');

// model
const models = require(__base + 'models');


// library
const _ = require('lodash');
const stringHelper = require(__base + 'helpers/StringHelper');

/**
 * Method
 * @module Method
 */
let Method = module.exports = {};

const getTagNames = function (taggables) {
  return _.map(taggables, function (val) {
    return val.tag.name;
  });
};

/**
 * @description Converts input into array
 * @method makeTagArray
 * @param  {String} tagNames
 * @return {Array}
 * @private
 */
const makeTagArray = function (tagNames) {
  if (_.isString(tagNames)) {
    tagNames = tagNames.split(',');
  } else if (!_.isArray(tagNames)) {
    tagNames = [];
  }
  return _.map(tagNames, _.trim);
};

/**
 * @description get Taggables
 * @method getTaggables
 * @param  {String} model
 * @param  {Number} modelId
 * @return {Promise}
 * @private
 */
const getTaggables = function (model, modelId) {
  //get current tag name
  return models.Taggable.findAll({
    where: {taggableId: modelId, type: model},
    include: [
      {
        model: models.Tag,
        as: 'tag'
      }
    ]
  });
};

/**
 * @description attach the tag
 * @method addTag
 * @param  {String} model
 * @param  {Number} modelId
 * @param  {String} tagName
 * @return {Promise}
 * @private
 */
const addTag = function (model, modelId, tagName) {
  return new Promise(async function(resolve, reject) {
    tagName = _.trim(tagName);

    let t = await models.sequelize.transaction();

    try {
      let tag = await models.Tag.findOrCreate({
        where: {slug: stringHelper.slugify(tagName)},
        defaults: {name: tagName},
        transaction: t
      });

      let taggable = await models.Taggable.findOrCreate({
        where: {tagId: tag[0].id, taggableId: modelId, type: model},
        transaction: t
      });
      if (taggable[1] === true) await tag[0].increment({count: 1}, {transaction: t});

      await t.commit();
      resolve();
    } catch (err) {
      await t.rollback();
      reject(err);
    }
  });
};

/**
 * @description remove the tag
 * @method removeTag
 * @param  {String} model
 * @param  {Number} modelId
 * @param  {String} tagName
 * @return {Promise}
 * @private
 */
const removeTag = function (model, modelId, tagName) {
  return new Promise(async function(resolve, reject) {
    tagName = _.trim(tagName);

    let t = await models.sequelize.transaction();

    try {
      let tag = await models.Tag.findOne({where: {slug: stringHelper.slugify(tagName)}, transaction: t});

      let taggable = await models.Taggable.findOne({
        where: {tagId: tag.id, taggableId: modelId, type: model},
        transaction: t
      });
      if (taggable !== null) taggable.destroy({transaction: t});
      await tag.decrement({count: 1}, {transaction: t});

      await t.commit();
      resolve();
    } catch (err) {
      await t.rollback();
      reject(err);
    }
  });
};


/**
 * @description Tag
 * @method tag
 * @param  {String} model
 * @param  {Number} modelId
 * @param  {String|Array} tagNames
 * @return {Promise}
 * @public
 */
Method.tag = function (model, modelId, tagNames) {
  return new Promise(async function(resolve, reject) {
    tagNames = makeTagArray(tagNames);

    let promise = [];
    _.each(tagNames, function (val) {
      promise.push(addTag(model, modelId, val));
    });
    await Promise.all(promise);

    logger.log('info', `added tag( ${tagNames.join(',')} ) from ${model} (${modelId})!`);
    resolve();
  });
};


/**
 * @description untag
 * @method untag
 * @param  {String} model
 * @param  {Number} modelId
 * @param  {String|Array} tagNames
 * @return {Promise}
 * @public
 */
Method.untag = function (model, modelId, tagNames) {
  return new Promise(async function(resolve, reject) {

    if (_.isUndefined(tagNames)) tagNames = await getTaggables(model, modelId);
    tagNames = makeTagArray(tagNames);

    let promise = [];
    await _.each(tagNames, function (val) {
      promise.push(removeTag(model, modelId, val));
    });
    await Promise.all(promise);

    logger.log('info', `removed tag(${tagNames.join(',')}) from ${model} (${modelId})!`);
    resolve();
  });
};

/**
 * @description retag
 * @method retag
 * @param  {String} model
 * @param  {Number} modelId
 * @param  {String|Array} tagNames
 * @return {Promise}
 * @public
 */
Method.retag = function (model, modelId, tagNames) {
  return new Promise(async function(resolve, reject) {
    try {
      tagNames = makeTagArray(tagNames);

      //get current tag name
      let taggables = await getTaggables(model, modelId);
      let currentTagNames = getTagNames(taggables);

      let deletions = _.difference(currentTagNames, tagNames);
      let additions = _.difference(tagNames, currentTagNames);

      debug('VALUE currentTagNames', currentTagNames);
      debug(`VALUE deletions ${deletions}`);
      debug(`VALUE additions ${additions}`);

      await Method.untag(model, modelId, deletions);
      await Method.tag(model, modelId, additions);

      resolve();
    } catch (err) {
      reject(err);
    }
  });
};
