'use strict';

const _ = require('lodash');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('PositionInvitationJob', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    positionId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    maxCost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0
    },
    cost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    filter: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: '{}'
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {
      includePositionInvitations: function () {
        return {
          include: [{
            //attributes: ['id', 'userId'],
            model: sequelize.models.PositionInvitation,
            as: 'positionInvitations',
          }]
        }
      },
      includePosition: function () {
        let date = moment().format('YYYY-MM-DD');
        return {
          include: [{
            model: sequelize.models.Position,
            as: 'position',
            include: [{
              model: sequelize.models.JobNature,
              as: 'jobNatures',
            }],
            required: false,
            where: {
              active: true,
              expiredDate: {
                $gte: `${date}T00:00:00.000Z`,
              }
            },
          }]
        }
      },
      includePositionWithSearch: function (filter) {
        let date = moment().format('YYYY-MM-DD');
        return {
          include: [{
            model: sequelize.models.Position,
            as: 'position',
            include: [{
              model: sequelize.models.JobNature,
              as: 'jobNatures',
            }],
            where: {
              active: true,
              expiredDate: {
                $gte: `${date}T00:00:00.000Z`,
              },
              name: {
                $iLike: `%${filter}%`
              }
            },
          }]
        }
      },
      includeCompany: function () {
        return {
          include: [{
            model: sequelize.models.Company, paranoid: true,
            as: 'company',
            where: {
              isApproved: true,
            },
            include: [{
              model: sequelize.models.CompanyPicture,
              as: 'icon',
              required: false,
              where: {
                isIcon: true,
              },
            }]
          }]
        };
      }
    },
  });

  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.associate = function (models) {
    Model.belongsTo(models.Position, {
      targetKey: 'id',
      foreignKey: 'positionId',
      onDelete: 'cascade',
      as: 'position'
    });

    Model.belongsTo(models.Company, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'company'
    });

    Model.hasMany(models.PositionInvitation, {
      targetKey: 'id',
      foreignKey: 'positionInvitationJobId',
      as: 'positionInvitations',
      onDelete: 'cascade',
    });

  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
