'use strict';

// core
const debug = require('debug')('APP:COMPANY_PICTURE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const path = require('path');
const randomstring = require("randomstring");

const s3 = require(__base + 'modules/s3');
const indicative = require('indicative');

let Route = module.exports = {};

const uploadPicture = async function(req, res, next) {
  debug('Enter upload picture method!');

  const rules = {
    file: 'array',
    'file.*': 'required|image',
  };

  let input = _.pick(req.files, Object.keys(rules));
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let company = await models.Company.scope(['includeCover', 'includeIcon']).findOne({
      where: {
        id: req.params.companyId
      },
      transaction: t,
    });
    if (company === null) throw new MainError('common', 'notFound');

    let fileKey = randomstring.generate(24);
    let extname = path.extname(input.file[0].originalname).toLowerCase();
    let filename = path.basename(input.file[0].originalname, extname);
    // 文件存放在服务器的位置. ${extname}
    let cloudPath = `company/${company.id}/picture/${fileKey}/original${extname}`;

    await s3.upload(input.file[0].path, cloudPath);

    // Insert into company picture table.
    let companyPictureAttributes = {};
    companyPictureAttributes.companyId = req.params.companyId;
    companyPictureAttributes.name = !_.isUndefined(req.body.name) ? req.body.name : filename;
    companyPictureAttributes.mime = input.file[0].mimetype;
    companyPictureAttributes.size = input.file[0].size;
    companyPictureAttributes.key = fileKey;
    companyPictureAttributes.extension = extname.substring(1);

    if (req.body.isCover === true) {
      companyPictureAttributes.isCover = true;
      if (company.cover !== null) await company.cover.destroy({transaction: t});
    } else if (req.body.isIcon === true) {
      companyPictureAttributes.isIcon = true;
      if (company.icon !== null) await company.icon.destroy({transaction: t});
    }

    let result = await models.CompanyPicture.create(companyPictureAttributes, {transaction: t});

    await t.commit();

    req.params.pictureId = result.id;
    if (req.body.isCover === true) {
      return Route.showCover(req, res, next);
    } else if (req.body.isIcon === true) {
      return Route.showIcon(req, res, next);
    } else {
      return Route.show(req, res, next);
    }

  } catch (err) {
    await t.rollback();
    next(err);
  }
};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  let filter = await res.paginatorHelper.initFilter(req.query);
  filter.where.companyId = req.params.companyId;
  filter.where.isIcon = false;
  filter.where.isCover = false;

  try {
    let result = await models.CompanyPicture.findAndCountAll(filter);
    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

Route.show = async function(req, res, next) {
  debug('Enter show method!');

  let filter = {
    where: {
      id: req.params.pictureId,
      companyId: req.params.companyId,
      isIcon: false,
      isCover: false,
    }
  };

  try {
    let result = await models.CompanyPicture.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.showIcon = async function(req, res, next) {
  debug('Enter showIcon method!');

  let filter = {
    where: {
      id: req.params.pictureId,
      companyId: req.params.companyId,
      isIcon: true,
    }
  };

  try {
    let result = await models.CompanyPicture.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.showCover = async function(req, res, next) {
  debug('Enter showIcon method!');

  let filter = {
    where: {
      id: req.params.pictureId,
      companyId: req.params.companyId,
      isCover: true,
    }
  };

  try {
    let result = await models.CompanyPicture.findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.destroy = async function(req, res, next) {
  debug('Enter destroy method!');
  let t = await models.sequelize.transaction();
  try {
    let result = await models.CompanyPicture.findOne({
      where: {
        id: req.params.pictureId,
        companyId: req.params.companyId,
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

Route.uploadCover = async function(req, res, next) {
  req.body.isCover = true;
  return uploadPicture(req, res, next);
};

Route.uploadIcon = async function(req, res, next) {
  req.body.isIcon = true;
  return uploadPicture(req, res, next);
};

Route.uploadPicture = async function(req, res, next) {
  req.body.isIcon = false;
  req.body.isCover = false;
  return uploadPicture(req, res, next);
};
