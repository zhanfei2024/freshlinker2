'use strict';
let moment = require('moment');
let _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('UserExperience', {
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
    companyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    startedDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    endedDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    hooks: {
      // beforeCreate: function (model, options) {
      //   _.each(['startedDate', 'endedDate'], function (item) {
      //     if (!_.isUndefined(model[item])) model[item] = moment.utc(model[item]).startOf('day').toISOString();
      //   });
      // },
      // beforeUpdate: function (model, options) {
      //   _.each(['startedDate', 'endedDate'], function (item) {
      //     if (!_.isUndefined(model[item])) model[item] = moment.utc(model[item]).startOf('day').toISOString();
      //   });
      // }
    },
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {
      includeUser: function () {
        return {
          include: [
            {
              model: sequelize.models.User, as: 'user',
            }
          ]
        };
      },
    },
  });

  // Class Method
  Model.getEditableKeys = function () {
    return ['companyName', 'title', 'startedDate', 'endedDate', 'description'];
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
    return this.dataValues;
  };
  return Model
};
