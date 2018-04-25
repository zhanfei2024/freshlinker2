'use strict';

// core
const debug = require('debug')('APP:USER_PICTURE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const path = require('path');
const randomstring = require("randomstring");
const s3 = require(__base + 'modules/s3');
const indicative = require('indicative');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  let filter = await res.paginatorHelper.initFilter();
  filter.where.userId = req.params.userId;
  filter.where.isIcon = false;

  try {
    let result = await models.UserPicture.findAndCountAll(filter);
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
      userId: req.params.userId,
      isIcon: false
    }
  };

  try {
    let result = await models.UserPicture.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.showIcon = async function (req, res, next) {
  debug('Enter showIcon method!');

  let filter = {
    where: {
      id: req.params.pictureId,
      userId: req.params.userId,
      isIcon: true
    }
  };

  try {
    let result = await models.UserPicture.findOne(filter);
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
    let result = await models.UserPicture.findOne({
      where: {
        id: req.params.pictureId,
        userId: req.params.userId
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

let uploadPicture = async function(req, res, next) {
  debug('Enter upload picture method!');
  const rules = {
    file: 'array',
    'file.*': 'required|image'
  };

  if (req.body.isIcon === true) {
    rules['file.*'] = `${rules['file.*']}|dimensions:min_width=200,ratio=1/1`;
  }

  let input = _.pick(req.files, Object.keys(rules));
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let user = await models.User.findOne({
      where: {
        id: req.params.userId
      },
      transaction: t
    });
    if (user === null) throw new MainError('common', 'notFound');

    let fileKey = randomstring.generate(24);
    let extname = path.extname(input.file[0].originalname).toLowerCase();
    let filename = path.basename(input.file[0].originalname, extname);
    // 文件存放在服务器的位置
    let cloudPath = `user/${user.id}/picture/${fileKey}/original${extname}`;

    await s3.upload(input.file[0].path, cloudPath);

    // remove old icon if uploading icon
    if (req.body.isIcon === true) {
      let userPicture = await models.UserPicture.findOne({
        where: {userId: res.locals.userAuth.id, isIcon: true},
        transaction: t
      });
      if (userPicture !== null) {
        await userPicture.destroy({transaction: t});
      }
    }
    // Insert into user picture table.
    let userPictureAttributes = {};
    userPictureAttributes.userId = req.params.userId;
    userPictureAttributes.isIcon = req.body.isIcon === true;
    userPictureAttributes.name = !_.isUndefined(req.body.name) ? req.body.name : filename;
    userPictureAttributes.mime = input.file[0].mimetype;
    userPictureAttributes.size = input.file[0].size;
    userPictureAttributes.key = fileKey;
    userPictureAttributes.extension = extname.substring(1);
    let result = await models.UserPicture.create(userPictureAttributes, {transaction: t});
    await t.commit();

    req.params.pictureId = result.id;
    if (result.isIcon) {
      return Route.showIcon(req, res, next);
    } else {
      return Route.show(req, res, next);
    }
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.uploadPicture = async function(req, res, next) {
  req.body.isIcon = false;
  return uploadPicture(req, res, next);
};

Route.uploadIcon = async function(req, res, next) {
  req.body.isIcon = true;
  return uploadPicture(req, res, next);
};
