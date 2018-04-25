'use strict';

// library
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Enterprise', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    paymentAccountId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    planExpiredDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    positionQuota: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    positionExpiredDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    balance: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    hooks: {},
    getterMethods: {
      fullName: function () {
        return this.firstName + ' ' + this.lastName;
      },
      canAddPosition: function () {
        return this.active === true && this.positionQuota > 0;
      }
    },
    setterMethods: {},
    defaultScope: {},
    scopes: {
      includeCompanies: function () {
        return {
          include: [
            {
              model: sequelize.models.Company, as: 'companies',
              order: ['updatedAt', 'DESC']
            }
          ]
        };
      },
      includePlan: function () {
        return {
          include: [
            {
              model: sequelize.models.Plan, as: 'plan',
              required: false,
            }
          ]
        };
      },
    },
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
  Model.associate = function (models) {
    Model.hasMany(models.Company, {
      targetKey: 'id',
      foreignKey: 'enterpriseId',
      onDelete: 'cascade',
      as: 'companies',
    });
    Model.belongsTo(models.Plan, {
      targetKey: 'id',
      foreignKey: 'planId',
      onDelete: 'cascade',
      as: 'plan',
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {

    return this.dataValues;
    
  };
  return Model;
};
