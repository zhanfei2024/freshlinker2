'use strict';

const commonConfig = require('../config/common');
const jobs = require('../jobs');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('CompanyFile', {
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
      allowNull: true
    },
    extension: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    hooks: {
      afterDestroy: function (instance, options) {
        jobs.create('s3::deleteByPath', {
          targetPath: `company/${instance.companyId}/files/${instance.key}`
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
    return ['companyId'];
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

    if(res.url === null) res.url = `${commonConfig.sourceUrl}/files/company/${res.companyId}/files/${res.key}/original.${res.extension}`;

    // hide field
    delete res.key;
    return res;
  };
  return Model;
};


