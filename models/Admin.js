'use strict';

// library
const bcrypt = require('bcryptjs');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Admin', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set: function (value) {
        this.setDataValue('password', bcrypt.hashSync(value, 10));
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mobilePhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    homePhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verifyTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    indexes: [
      {fields: ['email', 'password']}
    ],
    getterMethods: {},
    setterMethods: {},
  });

  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.initSeed = function () {
    let data = [{
      password: 'kenwong1120',
      email: 'hello@freshlinker.com'
    }];
    return Model.bulkCreate(data,{returning: true});
  };

  // Instance Methods
  Model.prototype.toJSON = function () {
    let res = this.dataValues;

    // hide field
    delete res.password;

    return res;
  };

  return Model;
};


