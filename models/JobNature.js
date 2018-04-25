'use strict';

// library
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('JobNature', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    hooks: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {},
    validate: false,
  });

  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.getReadAttributesByRole = function (roleName) {
    let attributes = this.getAttributes();
    switch (roleName) {
      case 'user':
        return attributes;
      case 'public':
        return attributes;
      case 'admin':
        return attributes;
    }
  };
  Model.getEditAttributesByRole = function (roleName) {
    let attributes = this.getAttributes();
    switch (roleName) {
      case 'user':
        return _.without(attributes, 'active');
      case 'public':
        return [];
      case 'admin':
        return attributes;
    }
  };
  Model.initSeed = function (){
    let nature = [
      {id: 1, name: 'Admin – Oriented', order: 1},
      {id: 2, name: 'Analytical – Oriented', order: 2},
      {id: 3, name: 'Creative - Oriented', order: 3},
      {id: 4, name: 'Management - Oriented', order: 4},
      {id: 5, name: 'People – Oriented', order: 5},
      {id: 6, name: 'R&D – Oriented', order: 6},
      {id: 7, name: 'Tech – Oriented', order: 7},
    ];
    return Model.bulkCreate(nature);
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
