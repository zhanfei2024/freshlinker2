'use strict';

// core
const debug = require('debug')('APP:USER_PORTFOLIO_PICTURE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const path = require('path');
const randomstring = require("randomstring");
const s3 = require(__base + 'modules/s3');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const indicative = require('indicative');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  let filter = await res.paginatorHelper.initFilter();
  filter.where.portfolioId = req.params.portfolioId;

  try {
    let result = await models.UserPortfolioPicture.findAndCountAll(filter);
    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function (req, res, next) {
  debug('Enter show method!');

  let filter = {
    where: {
      id: req.params.pictureId,
      portfolioId: req.params.portfolioId
    }
  };

  try {
    let result = await models.UserPortfolioPicture.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function (req, res, next) {
  debug('Enter destroy method!');
  let t = await models.sequelize.transaction();
  try {
    let result = await models.UserPortfolioPicture.findOne({
      where: {
        id: req.params.pictureId,
        portfolioId: req.params.portfolioId
      },
      transaction: t
    });
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({
      transaction: t
    });
    await t.commit();
    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.uploadPicture = async function(req, res, next) {
  debug('Enter upload picture method!');
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

  let t = await models.sequelize.transaction();
  try {
    let portfolio = await models.UserPortfolio.findOne({
      where: {
        id: req.params.portfolioId
      },
      transaction: t
    });
    if (portfolio === null) throw new MainError('common', 'notFound');
    let fileKey = randomstring.generate(24);
    let extname = path.extname(input.file[0].originalname).toLowerCase();
    let filename = path.basename(input.file[0].originalname, extname);
    // 文件存放在服务器的位置. ${extname}
    let cloudPath = `portfolio/${portfolio.id}/picture/${fileKey}/original${extname}`;

    await s3.upload(input.file[0].path, cloudPath);

    // Insert into user picture table.
    let portfolioPictureAttributes = {};
    portfolioPictureAttributes.portfolioId = portfolio.id;
    portfolioPictureAttributes.name = !_.isUndefined(req.body.name) ? req.body.name : filename;
    portfolioPictureAttributes.mime = input.file[0].mimetype;
    portfolioPictureAttributes.size = input.file[0].size;
    portfolioPictureAttributes.key = fileKey;
    portfolioPictureAttributes.extension = extname.substring(1);
    let result = await models.UserPortfolioPicture.create(portfolioPictureAttributes, {transaction: t});
    await t.commit();

    req.params.pictureId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};
