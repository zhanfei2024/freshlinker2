'use strict';

const winston = require('winston');

const logPath = './logs';

let logger = new (winston.Logger)({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    verbose: 'blue',
    debug: 'cyan',
    silly: 'magenta'
  },
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      level: 'silly',
      handleExceptions: true,
      json: false
    }),
    new winston.transports.File({
      name: 'full-log',
      filename: `./logs/full.log`,
      json: true,
      handleExceptions: true,
      maxsize: (1024 * 1024 * 1024)
    }),
    new (winston.transports.File)({
      name: 'info-log',
      filename: `${logPath}/info.log`,
      level: 'info',
      json: true,
      handleExceptions: true,
      maxsize: (1024 * 1024 * 500)
    }),
    new (winston.transports.File)({
      name: 'error-log',
      filename: `${logPath}/error.log`,
      level: 'error',
      json: true,
      maxsize: (1024 * 1024 * 500)
    })
  ],
  exitOnError: false
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding){
    logger.info(message);
  }
};
