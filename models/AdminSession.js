'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('AdminSession', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    adminId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    indexes: [
      {fields: ['adminId', 'token']}
    ],
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
  });

  // Class Method
  Model.associate = function (models) {
    Model.belongsTo(models.Admin,{
      targetKey: 'id',
      foreignKey: 'adminId',
      onDelete: 'cascade',
      as: 'admin'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
