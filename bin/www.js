#!/usr/bin/env node

// ***************************************
// CORE INIT BEGIN
// ***************************************
// path setup
global.__base = __dirname + '/../';

// Config Init
let envPath = '.env';
if (process.env.NODE_ENV !== 'production')
  envPath = `.env.${process.env.NODE_ENV || 'development'}`;

require('dotenv').config({
  path: envPath
});

// ***************************************
// CORE INIT END
// ***************************************

// core
const http = require('http');
http.globalAgent.maxSockets = Infinity;

// library
const logger = require(__base + 'modules/logger');
const debug = require('debug')('APP:BOOTSTRAP');
const app = require('../app');


/**
 * Get port from environment and store in Express.
 */
let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);


/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * socket
 */
const io = require('socket.io').listen(server, {
  'maxHttpBufferSize': 1000000,
  serveClient: false,
  ws: false,
  wss: false
});
require('../io')(io);

listenServer();


/**
 * Service
 *
 */
function listenServer() {
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  logger.log('info', `Server started, Listening on: ${port}`);
}
