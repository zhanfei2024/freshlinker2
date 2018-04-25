'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('PositionCategoryMap', {}, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    getterMethods: {},
    setterMethods: {},
  });

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

