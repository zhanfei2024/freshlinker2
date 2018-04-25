'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('CommentLike', {}, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    classMethods: {},
    getterMethods: {},
    setterMethods: {},
  });

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

