'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('CandidateQuestionAttachment', {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      candidateQuestionId: {
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
    Model.belongsTo(models.CandidateQuestion, {
      targetKey: 'id',
      foreignKey: 'candidateQuestionId',
      onDelete: 'cascade',
      as: 'question'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

