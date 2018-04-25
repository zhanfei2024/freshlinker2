'use strict';

const debug = require('debug')('HR:CRON:DAILY');

// library
const _ = require('lodash');
const fs = require('fs');
const cronMethod = require(__baseHR + 'methods/cron');
const CronJob = require('cron').CronJob;

const jobs = [
  {
    name: 'daily',
    time: '00 00 00 * * *',
    list: []
  }
];


_.each(jobs, function (type) {



});



let cron = {
  cronTime: '00 00 00 * * *',
  // cronTime: '*/5 * * * * *',
  startSchedule: function (jobTypeListIndex) {
    let tasks = [];

    let files = fs.readdirSync(__dirname);
    for (let i = 0; i < files.length; i++) {
      if (files[i].indexOf('index') > -1) {
        continue;
      }
      tasks.push(require('./' + files[i]));
    }

    cronMethod.startSchedule(cron.cronTime, jobTypeListIndex, tasks);
  }
};
