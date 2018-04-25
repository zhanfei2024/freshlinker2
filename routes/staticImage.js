'use strict';

// core
const debug = require('debug')('APP:STATIC_IMAGE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const path = require('path');
const moment = require('moment');
const randomstring = require("randomstring");
const commonConfig = require(__base + 'config/common');

const s3 = require(__base + 'modules/s3');
const indicative = require('indicative');

let Route = module.exports = {};

Route.uploadImage = async function(req, res, next) {
  debug('Enter upload image method!');
  const rules = {
    file: 'array',
    'file.*': 'required|image'
  };

  let input = _.pick(req.files, Object.keys(rules));
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let fileKey = randomstring.generate(24);
    let extname = path.extname(input.file[0].originalname).toLowerCase();

    let cloudPath = `static/${moment().format('YYYY')}/${moment().format('MM')}/${fileKey}${extname}`;

    await s3.upload(input.file[0].path, cloudPath);


    return res.item({
      url: `${commonConfig.sourceUrl}/${cloudPath}`
    });
  } catch (err) {
    return next(err);
  }
};
