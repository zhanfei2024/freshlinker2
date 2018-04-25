'use strict';
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Bookmark', {
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
      positionId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
    }, {
      charset: 'utf8',
      timestamps: true,
      freezeTableName: true,
      getterMethods: {},
      setterMethods: {},
      defaultScope: {},
      scopes: {
        includePosition: function () {
          let expiredDate = moment().format('YYYY-MM-DD');

          return {
            include: [
              {
                attributes: ['active', 'expiredDate'],
                model: sequelize.models.Position, as: 'position',
                where: {
                  active: true,
                  expiredDate: { $gte: expiredDate }
                },
              }
            ]
          };
        },
        includePositionWithSearch: function (filter) {
          let expiredDate = moment().format('YYYY-MM-DD');

          return {
            include: [
              {
                attributes: ['active', 'expiredDate'],
                model: sequelize.models.Position, as: 'position',
                where: {
                  active:true,
                  name: { $iLike: `%${filter}%` },
                  expiredDate : {$gte: expiredDate}
                }
              }
            ]
          };
        },
        includeUser: function () {
          return {
            include: [
              {
                model: sequelize.models.User, as: 'user',
                include: [
                  {
                    model: sequelize.models.UserEducation, as: 'educations',
                    include: [
                      {model: sequelize.models.EducationLevel, as: 'educationLevel'}
                    ]
                  },
                ]
              }
            ]
          };
        },
      },
    }
  );

  // Class Method
  Model.getEditableKeys = function () {
    return ['userId','positionId'];
  };
  Model.associate = function (models) {
    Model.belongsTo(models.User,{
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'SET NULL',
      as: 'user'
    });
    Model.belongsTo(models.Position,{
      targetKey: 'id',
      foreignKey: 'positionId',
      onDelete: 'SET NULL',
      as: 'position'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
