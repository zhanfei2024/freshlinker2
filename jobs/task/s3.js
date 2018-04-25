'use strict';

// core
const debug = require('debug')('APP:TASK_S3');
const logger = require(__base + 'modules/logger');

// model

// library
const s3 = require(__base + 'modules/s3');

const prefix = 's3';

module.exports = function (queue) {

  /**
   * @description upload a files
   * @method upload
   * @param  {String} sourcePath
   * @param  {String} targetPath
   * @param  {Object} headers
   * @return {Promise}
   * @public
   */
  queue.process(`${prefix}::upload`, 1, function (job, done) {
    s3.upload(job.data.sourcePath, job.data.targetPath).then(function () {
      done();
    });
  });

  /**
   * @description delele a files
   * @method upload
   * @param  {String} targetPath
   * @param  {Object} headers
   * @return {Promise}
   * @public
   */
  queue.process(`${prefix}::deleteByPath`, 1, function (job, done) {
    s3.deleteByPath(job.data.targetPath).then(function () {
      done();
    });
  });
};
