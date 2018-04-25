'use strict';
const _ = require('lodash');
const imageConfig = require('../config/image');
const commonConfig = require('../config/common');
const jobs = require('../jobs');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('CompanyPicture', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    isIcon: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isCover: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
          targetPath: `company/${instance.companyId}/picture/${instance.key}`
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
    return ['companyId', 'isIcon'];
  };
  Model.associate = function (models) {
    Model.belongsTo(models.Company, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'company'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    let res = this.dataValues;

    let url = {};
    _.each(imageConfig.imageSizeList, function (val) {
      url[val] = `${commonConfig.sourceUrl}/files/w${val}-h${val}/company/${res.companyId}/picture/${res.key}/original.${res.extension}`;
    });

    this.setDataValue('url', url);

    // hide field
    delete res.key;
    return res;
  };
  return Model;
};

