'use strict';

let fs = require('fs');
let path = require('path');
require('pg').defaults.parseInt8 = true;
let Sequelize = require('sequelize');
let _ = require('lodash');

require('sequelize-hierarchy')(Sequelize);

let basename = path.basename(module.filename);

let config = require(__base + 'config/database');
let db = {};
let debug = require('debug')('APP:MODEL');

config.logging = function (value) {
  debug(value);
};
config.timezone = '+00:00';

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function (file) {
    if (file.slice(-3) !== '.js') return;
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }

  if (typeof db[modelName].attributes.appId !== 'undefined') {
    _.each(['beforeFind'], function (value) {
      db[modelName].addHook(value, function (model, fn) {
        if (typeof model.where === 'undefined') model.where = {};
        model.where = _.extend({appId: global.locals.app.id}, model.where);
        fn(null, model);
      });
    });

    if (typeof db[modelName].attributes.id !== 'undefined') {
      db[modelName].options.indexes.unshift({
        fields: ['appId', 'id']
      });
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
