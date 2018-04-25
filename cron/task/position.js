// core
const debug = require('debug')('APP:TASK_POSITION');


// model
const models = require(__base + 'models');
// library
const positionInvitationMethod = require(__base + 'methods/positionInvitationMethod');

module.exports = function (CronJob) {

  const send = async function() {
    try {
      // get all Position Invitation
      let positionInvitationJobs = await models.PositionInvitationJob.scope(['includePosition']).findAll({
        where: {
          active: true
        }
      });
      positionInvitationJobs.forEach(async function(positionInvitationJob) {
        try {
          let users = await positionInvitationMethod.search(positionInvitationJob.position.id, positionInvitationJob.companyId);
          for (let user of users) {
            await positionInvitationMethod.createInvitation(positionInvitationJob.position.id, user.id, positionInvitationJob.id, positionInvitationJob.companyId);
          }
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        }
      });
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };


  let job = new CronJob({
    // every hour
    cronTime: '0 */1 * * *',
    onTick: function () {
      debug('running task matchUserAndSendInvitation...');

      return send();
    },
    start: false
  });
  job.start();

};
