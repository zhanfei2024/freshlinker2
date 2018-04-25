// core
const debug = require('debug')('APP:TASK_POSITION_BE_EXPIRED_SEND_EMAIL');

// model
const models = require(__base + 'models');
// library
const positionMethod = require(__base + 'methods/positionMethod');

module.exports = function (CronJob) {

  const send = async function() {
    try {
      positionMethod.pushExpiredEmail();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };


  let job = new CronJob({
    // every hour
    cronTime: '00 30 23 * * *',
    onTick: function () {
      debug('running task :Notify enterprise to have position will at the 7 days later expired ...');
      return send();
    },
    start: false
  });
  job.start();

};
