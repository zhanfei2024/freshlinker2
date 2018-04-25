'use strict';
const _ = require('lodash');
const imageConfig = require('../config/image');
const commonConfig = require('../config/common');
const jobs = require('../jobs');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('PostImage', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    postId: {
      type: DataTypes.BIGINT,
      allowNull: false
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
        //return deleteFileFromS3Job.queue(`post/${instance.companyId}/image/${instance.key}`);
        jobs.create('s3::deleteByPath', {
          targetPath: `post/${instance.companyId}/image/${instance.key}`
        });
      }
    },
    getterMethods: {},
    setterMethods: {},
  });

  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.associate = function (models) {
    Model.belongsTo(models.Post, {
      targetKey: 'id',
      foreignKey: 'postId',
      onDelete: 'cascade',
      as: 'post'
    });
  };
  // Instance Method
  Model.prototype.toJSON = function () {
    let res = this.dataValues;
    let url = {};
    _.each(imageConfig.imageSizeList, function (val) {
      url[val] = `${commonConfig.sourceUrl}/files/w${val}/post/${res.postId}/image/${res.key}/original.${res.extension}`;
    });

    this.setDataValue('url', url);
    // hide field
    delete res.key;
    return res;
  };
  return Model;
};

