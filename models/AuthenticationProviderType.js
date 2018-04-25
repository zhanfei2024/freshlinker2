'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('AuthenticationProviderType', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    charset: 'utf8',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {fields: ['id', 'code']}
    ],
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {},
  });

  // Class Method
  Model.initSeed = function () {
    let data = [
      {id:1,name: 'YOOV', code: 'yoov', default: true},
      {id:2,name: 'Facebook', code: 'facebook', default: false},
      {id:3,name: 'Google', code: 'google', default: false}
    ];
    return Model.bulkCreate(data,{return: true});
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };

  return Model;
};
