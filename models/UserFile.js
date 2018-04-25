'use strict';

const debug = require('debug')('APP:USER_PICTURE');
const commonConfig = require('../config/common');
const jobs = require('../jobs');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('UserFile', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    extension: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mime: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    hooks: {
      afterDestroy: function (instance, options) {
        jobs.create('s3::deleteByPath', {
          targetPath: `user/${instance.userId}/file/${instance.key}`
        });
      }
    },
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {},
  });

  // Class Method
  Model.getEditableKeys = function () {
    return ['userId'];
  };
  Model.associate = function (models) {
    Model.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    let res = this.dataValues;

    let url = `${commonConfig.sourceUrl}/files/user/${res.userId}/file/${res.key}.${res.extension}`;
    this.setDataValue('url', url);

    // // hide field
    delete res.key;

    return res;
  };
  return Model;
};

