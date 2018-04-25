'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('CandidateQuestion', {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      candidateId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true
      },
    }, {
      charset: 'utf8',
      timestamps: true,
      freezeTableName: true,
      getterMethods: {},
      setterMethods: {},
      defaultScope: {},
      scopes: {},
    }
  );

  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.getReadAttributesByRole = function (roleName) {
    let attributes = this.getAttributes();
    switch (roleName){
      case 'user':
        return attributes;
      case 'company':
        return attributes;
      case 'public':
        return [];
      case 'admin':
        return attributes;
    }
  };
  Model.getEditAttributesByRole = function (roleName) {
    let attributes = this.getAttributes();
    switch (roleName) {
      case 'user':
        return [];
      case 'public':
        return [];
      case 'admin':
        return attributes;
    }
  };
  Model.associate = function (models) {
    Model.belongsTo(models.Candidate, {
      targetKey: 'id',
      foreignKey: 'candidateId',
      onDelete: 'cascade',
      as: 'candidate'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

