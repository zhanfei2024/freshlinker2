'use strict';

const debug = require('debug')('APP:FILE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const s3 = require('knox').createClient(require(__base + 'config/filesystem'));
const imageConfig = require(__base + 'config/image');

// library for resizer
const ImageResizer = require('image-resizer');
const ImageResizerImg = ImageResizer.img;
const ImageResizerStream = ImageResizer.streams;

/**
 * Upload Route
 * @module Route
 */
let Route = module.exports = {};

Route.getResizeImage = function (req, res, next) {
  try {
    res.setHeader('Cache-Control', 'public, max-age=2592000');

    let path = req.path.replace(/\/files/g, '');
    let image = new ImageResizerImg(req, path);

    image.getFile()
      .pipe(new ImageResizerStream.identify())
      .pipe(new ImageResizerStream.resize())
      .pipe(new ImageResizerStream.filter())
      .pipe(new ImageResizerStream.optimize())
      .pipe(ImageResizerStream.response(req, res));
  } catch (err) {
    next(err);
  }
};

Route.getUserFile = async function(req, res, next) {
  debug('Enter get file from s3 method!');

  try {
    let file = await models.UserFile.findOne({
      where: {
        userId: req.params.userId
      }
    });
    if (file === null || file.key !== req.params.key) throw new MainError('common', 'notFound');

    s3.getFile(`user/${file.userId}/file/${file.key}.${file.extension}`, function (err, stream) {
      if (err) {
        debug(`ERROR %j`, err);
        return next(err);
      }
      res.type(stream.headers['content-type']);
      stream.pipe(res);
    }).end();
  } catch (err) {
    debug(`ERROR %j`, err);
    return next(err);
  }

};

//TODO SHOULD be REMOVE
Route.getCompanyPicture = async function(req, res, next) {

  try {
    if (imageConfig.imageSizeList.indexOf(req.params.width) === -1) throw new MainError('common', 'notFound');

    let picture = await models.CompanyPicture.findOne({
      where: {
        id: req.params.pictureId,
        companyId: req.params.companyId
      }
    });
    if (picture === null || picture.key !== req.params.key) throw new MainError('common', 'notFound');
    //TODO redirect correct fileName path
    s3.getFile(`company/${picture.companyId}/picture/${picture.key}/${req.params.width}X${req.params.height}`, function (err, stream) {
      if (err) {
        debug(`ERROR %j`, err);
        return next(err);
      }
      res.type(stream.headers['content-type']);
      stream.pipe(res);
    }).end();
  } catch (err) {
    debug(`ERROR %j`, err);
    return next(err);
  }

};

//TODO SHOULD be REMOVE
Route.getUserPicture = async function(req, res, next) {
  try {
    //TODO redirect correct fileName path
    if (imageConfig.imageSizeList.indexOf(req.params.width) === -1) throw new MainError('common', 'notFound');

    let userPicture = await models.UserPicture.findOne({
      where: {
        id: req.params.pictureId,
        userId: req.params.userId
      }
    });
    if (userPicture === null || userPicture.key !== req.params.key) throw new MainError('common', 'notFound');

    s3.getFile(`user/${userPicture.userId}/picture/${userPicture.key}/${req.params.width}X${req.params.height}`, function (err, stream) {
      if (err) {
        debug(`ERROR %j`, err);
        return next(err);
      }
      res.type(stream.headers['content-type']);
      stream.pipe(res);
    }).end();
  } catch (err) {
    debug(`ERROR %j`, err);
    return next(err);
  }

};

//TODO SHOULD be REMOVE
Route.getUserPortfolioPicture = async function(req, res, next) {
  try {
    //TODO redirect correct fileName path
    if (imageConfig.imageSizeList.indexOf(req.params.width) === -1) throw new MainError('common', 'notFound');

    let picture = await models.UserPortfolioPicture.findOne({
      where: {
        id: req.params.pictureId,
        userId: req.params.userId
      }
    });
    if (picture === null || picture.key !== req.params.key) throw new MainError('common', 'notFound');

    s3.getFile(`portfolio/${picture.portfolioId}/picture/${picture.key}/${req.params.width}X${req.params.height}`, function (err, stream) {
      if (err) {
        debug(`ERROR %j`, err);
        return next(err);
      }
      res.type(stream.headers['content-type']);
      stream.pipe(res);
    }).end();
  } catch (err) {
    debug(`ERROR %j`, err);
    return next(err);
  }
};

//TODO SHOULD be REMOVE
Route.getStaticImage = async function(req, res, next) {
  try {
    s3.getFile(`static/${req.params.year}/${req.params.month}/${req.params.key}.${req.params.ext}`, function (err, stream) {
      if (err) {
        debug(`ERROR %j`, err);
        return next(err);
      }
      res.type(stream.headers['content-type']);
      stream.pipe(res);
    }).end();
  } catch (err) {
    debug(`ERROR %j`, err);
    return next(err);
  }
};

//TODO SHOULD be REMOVE
Route.getPostImage = async function(req, res, next) {
  try {
    if (imageConfig.imageSizeList.indexOf(req.params.width) === -1) throw new MainError('common', 'notFound');

    let image = await models.PostImage.findOne({
      where: {
        id: req.params.imageId,
        postId: req.params.postId
      }
    });
    if (image === null || image.key !== req.params.key) throw new MainError('common', 'notFound');
    //TODO redirect correct fileName path
    s3.getFile(`post/${image.postId}/image/${image.key}/${req.params.width}X${req.params.height}`, function (err, stream) {
      if (err) {
        debug(`ERROR %j`, err);
        return next(err);
      }
      res.type(stream.headers['content-type']);
      stream.pipe(res);
    }).end();
  } catch (err) {
    debug(`ERROR %j`, err);
    return next(err);
  }

};

Route.getCompanyFile = async function(req,res,next){
  debug('Enter get company file method!');

  let path = req.path.replace(/\/files/g, '');

  try {
    let file = await models.CompanyFile.findOne({
      where: {
        userId: req.params.companyId,
        key: req.params.key
      }
    });
    if (file === null) throw new MainError('common', 'notFound');

    s3.getFile(path, function (err, stream) {
      if (err) {
        debug(`ERROR %j`, err);
        return next(err);
      }
      res.type(stream.headers['content-type']);
      stream.pipe(res);
    }).end();
  } catch (err) {
    debug(`ERROR %j`, err);
    return next(err);
  }

};
