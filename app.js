const express = require('express');

// library
const debug = require('debug')('APP:MAIN');
const _ = require('lodash');
const i18n = require('i18n');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

/**
 * VIEW init
 */
const handlebarsLayouts = require('handlebars-layouts');
const hbs = require('hbs');
hbs.registerPartials(__dirname + '/views');
hbs.registerHelper(handlebarsLayouts(hbs.handlebars));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/**
 * Logger Init
 */
const logger = require(__base + 'modules/logger');
app.use(require('morgan')('combined', {'stream': logger.stream}));

/**
 * i18n Init
 */
i18n.configure({
  defaultLocale: 'en-us',
  locales: ['en-us', 'zh-hk'],
  directory: __dirname + '/langs'
});
app.use(i18n.init);

/**
 * MainError init
 */
global.MainError = function (fileName, value) {
  this.fileName = this.name = fileName;
  this.fileNameKey = value || '';
  return this;
};
global.MainError.prototype = new Error();

/**
 * Helmet Module
 */
const helmet = require('helmet');
app.use(helmet());

/**
 * Presenter Middleware
 */
app.use(require(__base + 'modules/presenter')({
  errorDir: __dirname + '/errors/'
}));

/**
 * CORS MIDDLEWARE
 */
app.use(require('cors')());

/**
 * Mulipart data body handler
 */
app.multipartForm = require('multer')({
  dest: __base + '.tmp/',
  limits: {
    fieldNameSize: 100,
    fileSize: 1024 * 1024 * 1024,
    fields: 100
  },
  fileFilter: function (req, file, cb) {
    let extensions = 'pdf,doc,docx,xls,xlsx,csv,txt,rtf,html,zip,mp3,wma,mpg,jpg,jpeg,png,gif'.split(',');

    if (extensions.indexOf(path.extname(file.originalname).substring(1).toLowerCase()) === -1) {
      return cb(new MainError('file', 'unsupportedFormat'));
    }
    cb(null, true);
  }
});
app.use(require('multer-autoreap'));

/**
 *  Validation Init
 */
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
app.use(function (req, res, next) {
  _.each(validateHelper.extend, function (val, key) {
    indicative.extend(key, val, '{{field}} is invalid.');
  });
  res.validatorMessage = validateHelper.message;
  res.paginatorHelper = validateHelper.paginatorHelper;
  next();
});

/**
 *  Global variable
 */
app.use(function (req, res, next) {
  res.locals = {
    authProvider: {},
    jwt: {},
    adminAuth: {},
    userAuth: {},
    enterpriseAuth: {},
    companyIds: [],
    app: {},
    companyRole: [],
    setting: {
      questionCount: 3
    },
  };
  next();
});

/**
 *  Route
 */
require('./route')(app);


if (process.env.NODE_ENV !== 'production') app.use('/apidoc', express.static(__dirname + '/public/apidoc'));

const mime = require('mime');
const fs = require('fs');

/**
 *  Backend Route
 */
app.use(require('prerender-node').set('prerenderToken', 'BW9iDAD9l7QSZjypUENQ'));
app.use(require('prerender-node').set('protocol', 'https'));
app.get(['/shyboys', '/shyboys*'], function (req, res) {
  // let ips = process.env.ALLOWIPS.split(',');
  // debug(`IP: %j`, req.headers['x-real-ip'] || req.ip);
  // let index = _.indexOf(ips, req.headers['x-real-ip'] || req.ip);
  // if (index === -1) return res.redirect(process.env.BASEURL);
  // debug(`INDEX: %j`, index);


  let url = `${__dirname}${String(req.url).replace('/shyboys/', '/backend/')}`;
  let backendIndexPath = `${__dirname}/backend/index.html`;
  let urlExt = path.extname(url);
  if (url.indexOf("?") !== -1) url = url.slice(0, url.indexOf("?"));
  debug('URLEXT===>', urlExt);
  fs.readFile(urlExt === '' ? backendIndexPath : url, function (err, data) {
    if (err) return res.status(404).send('File not found.');
    res.setHeader("Content-Type", urlExt === '' ? 'text/html' : mime.lookup(url));
    console.log('mime.lookup(url)==>', mime.lookup(url), url);
    res.send(data);
  });
});

app.use('/', express.static(__dirname + '/frontend'));

app.use(express.static(__dirname + '/frontend', {
  setHeaders: function (res, path) {
    if (mime.lookup(path) === 'text/html') {
      res.setHeader('Cache-Control', `public, max-age=0`)
    } else {
      res.setHeader('Cache-Control', `public, max-age=2592000`);
    }
  }
}));

app.get('/[^\.]+$', function (req, res) {
  res.set('Content-Type', 'text/html').sendFile(__dirname + '/frontend/index.html');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    debug(`ERROR: %j`, err);
    if (err instanceof MainError) {
      return res.error(err.fileName, err.fileNameKey);
    }
    return res.customError(err.message);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  debug(`ERROR: %j`, err);
  if (err instanceof MainError) {
    return res.error(err.fileName, err.fileNameKey);
  }
  return res.customError(err.message);
});

module.exports = app;
