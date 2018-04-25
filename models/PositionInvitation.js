'use strict';
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('PositionInvitation', {
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
    companyId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    positionId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    positionInvitationJobId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {
      pending: function () {
        let expiredDate = moment().format('YYYY-MM-DD');
        return {
          include: [
            {
              model: sequelize.models.Position, as: 'position',
              required: true,
              where:{
                active:true,
                expiredDate : {$gte: expiredDate}
              }
            }
          ]
        }
      },
      pendingWithSearch: function (filter) {
        let expiredDate = moment().format('YYYY-MM-DD');
        return {
          include: [
            {
              model: sequelize.models.Position, as: 'position',
              required: true,
              where: {
                active:true,
                name: {$iLike: `%${filter}%`},
                expiredDate : {$gte: expiredDate}
              }
            }
          ]
        }
      },

      includePosition: function () {
        return {
          include: [
            {
              model: sequelize.models.Position, as: 'position',
              required: true
            }
          ]
        }
      },
      includePositionInvitationJob: function () {
        return {
          include: [
            {
              model: sequelize.models.PositionInvitationJob, as: 'positionInvitationJob', paranoid: true,
            }
          ]
        }
      },
      includeCompanyAndEnterprise: function () {
        return {
          include: [
            {
              model: sequelize.models.Company, as: 'company', paranoid: true,
              where: {
                isApproved: true,
              },
              include: [
                {
                  model: sequelize.models.Enterprise, as: 'enterprise',
                }
              ]
            }
          ]
        };
      },
      includeCompany: function () {
        return {
          include: [
            {
              model: sequelize.models.Company, as: 'company', paranoid: true,
              where: {
                isApproved: true,
              },
              include: [
                {
                  model: sequelize.models.CompanyPicture, as: 'pictures',
                },
                {
                  model: sequelize.models.CompanyPicture, as: 'icon',
                  required: false,
                  where: {
                    isIcon: true,
                  },
                }
              ]
            }
          ]
        };
      },
    },
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
        return attributes;
      case 'public':
        return [];
      case 'admin':
        return attributes;
    }
  };
  Model.associate = function (models) {
    Model.belongsTo(models.Position, {
      targetKey: 'id',
      foreignKey: 'positionId',
      onDelete: 'cascade',
      as: 'position'
    });

    Model.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });

    Model.belongsTo(models.Company, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'company'
    });

    Model.belongsTo(models.PositionInvitationJob, {
      targetKey: 'id',
      foreignKey: 'positionInvitationJobId',
      onDelete: 'cascade',
      as: 'positionInvitationJob'
    });

  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

