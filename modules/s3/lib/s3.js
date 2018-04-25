'use strict';

// core
const debug = require('debug')('APP:S3_METHOD');
const logger = require(__base + 'modules/logger');

// library
const moment = require('moment');
const _ = require('lodash');
const s3 = require('knox').createClient(require(__base + 'config/filesystem'));
const gm = require('gm');
const fs = require('fs');

/**
 * Method
 * @module Method
 */
let Method = module.exports = {};

/**
 * @description delete s3 files/folder
 * @method deleteByPath
 * @param  {String} path
 * @return {Promise}
 * @public
 */
Method.deleteByPath = async function(path) {
  return new Promise(async function(resolve, reject) {
    if (path === '') {
      resolve(true);
      return;
    }
    let removeFilesPromise = await new Promise(function (resolve, reject) {
      let prefix = path + '';
      logger.log('info', `starting delete path: ${prefix}`);
      s3.list({prefix: prefix}, function (err, data) {
        if (err) {
          logger.log('info', `deleted failed from s3`, err);
          reject(err);
        }
        let list = [], i;

        logger.log('info', `files need to delete:`);
        for (i = 0; i < data.Contents.length; i++) {
          logger.log('info', `file: ${data.Contents[i].Key}`);
          list.push(data.Contents[i].Key);
        }

        list.push(prefix);
        s3.deleteMultiple(list, function (err, res) {
          if (err) reject(err);
          resolve(true);
        });
      });
    });
    logger.log('info', `delete file status: ${removeFilesPromise}`);
    if (removeFilesPromise === true) {
      resolve(true);
    } else {
      reject(removeFilesPromise);
    }
  });
};

/**
 * @description upload a image with resize action
 * @method upload
 * @param  {String} sourcePath
 * @param  {String} targetPath
 * @param  {Array} sizeList
 * @return {Promise}
 * @public
 */
Method.uploadImageWithResize = async function(sourcePath, targetPath, sizeList) {
  debug(`ENTER uploadImageWithResize Method!`);
  // sizeList = ['original', 1024, 600, 480, 240, 200, 160, 100, 32];
  if (_.isUndefined(sizeList) && !_.isArray(sizeList)) sizeList = ['original'];
  let uploadToS3Promise = [];
  let breakAll = false;

  try {
    // download file from s3
    sourcePath = await Method.getFile(sourcePath);
  } catch (err) {
    return Promise.reject(`upload failed! source file: ${sourcePath} is not exist!`);
  }

  try {
    for (let i = 0; i < sizeList.length; i++) {
      let uploadPromise = new Promise(function (resolve, reject) {

        let imagePath = `${sourcePath}${sizeList[i]}X${sizeList[i]}`;
        let uploadPath = `${targetPath}${sizeList[i]}`;

        let gmAction = gm(sourcePath).setFormat('jpg');
        if (sizeList[i] !== 'original') {
          uploadPath = `${targetPath}${sizeList[i]}X${sizeList[i]}`;
          gmAction = gmAction.resize(sizeList[i], sizeList[i]);
        }

        gmAction.write(imagePath, function (err) {
          if (err) {
            logger.log('error', `ERROR in resizing image`, err);
            breakAll = true;
            return reject();
          }
          Method.upload(imagePath, uploadPath).then(function () {
            return resolve();
          }).catch(function () {
            return reject();
          });
        });
      });
      uploadToS3Promise.push(uploadPromise);
    }
  } catch (err) {
    logger.log('error', `ERROR in resizing image`, err);
    breakAll = true;
  }
  return new Promise(async function(resolve, reject) {
    try {
      let result = await Promise.all(uploadToS3Promise);

      // remove source file
      fs.unlinkSync(sourcePath);

      // something get wrong. MUST remove all uploaded image
      if (breakAll) {
        logger.log('info', `breakAll is true, upload failed!`);
        logger.log('info', `try to delete uploaded image`);

        let deletePromises = [];
        _.each(result, function (val) {
          deletePromises.push(Method.deleteByPath(val));
        });
        try {
          await Promise.all(deletePromises);
          return resolve();
        } catch (err) {
          logger.log('error', `delete uploaded image failed!`, {pathNeedToDelete: result})
          reject();
        }
      } else {
        // remove source file from s3
        await Method.deleteByPath(sourcePath);
        logger.log('info', `uploaded all image with resize!`);
        return resolve();
      }
    } catch (err) {
      logger.log('error', `Upload failed!`, err);
      return reject();
    }
  });
};

/**
 * @description upload a files
 * @method upload
 * @param  {String} sourcePath
 * @param  {String} targetPath
 * @param  {Object} headers
 * @return {Promise}
 * @public
 */
Method.upload = async function(sourcePath, targetPath, headers) {
  return new Promise(async function (resolve, reject) {

    s3.putFile(sourcePath, targetPath, headers || {}, function (err, res) {
      if (err) return reject(err);
      if (res.statusCode !== 200) return reject(new MainError('file', 'upload2AWS'));
      logger.log('info', `uploaded a file to ${targetPath}!`);
      return resolve(targetPath);
    });
  });
};

/**
 * @description download a file
 * @method getFile
 * @param  {String} sourcePath
 * @return {Promise}
 * @public
 */
Method.getFile = async function(sourcePath, targetPath) {
  targetPath = targetPath || sourcePath;
  debug(`ENTER getFile Method!`);
  let file = fs.createWriteStream(`${targetPath}`);
  return new Promise(function (resolve, reject) {
    s3.getFile(`${sourcePath}`, function (err, stream) {
      if (err) {
        logger.log('info', `failed to download a file: ${sourcePath}`, err);
        return reject(err);
      }
      if (stream.statusCode !== 200){
        logger.log('info', `failed to download a file: ${sourcePath}`, err);
        return reject(`failed to download a file: ${sourcePath}`);
      }
      debug('writing file...');
      stream.on('data', function (chunk) {
        file.write(chunk);
      });
      stream.on('end', function (chunk) {
        file.end();
        logger.log('info', `downloaded file to local path: ${targetPath}`);
        return resolve(`${targetPath}`);
      });
    });
  });
};
