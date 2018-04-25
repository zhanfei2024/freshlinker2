'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('UserExpectJob', {
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
    locationId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    jobNatureId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    expectPositionId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('full-time', 'part-time', 'internship', 'freelance', 'others'),
      allowNull: false,
      defaultValue: 'full-time'
    },
    salaryType: {
      type: DataTypes.ENUM('hourly', 'monthly', 'yearly'),
      allowNull: false,
      defaultValue: 'monthly'
    },
    minSalary: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    maxSalary: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    content: {
      type: DataTypes.TEXT,
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
      includeJobNature: function () {
        return {
          include: [
            {
              model: sequelize.models.JobNature, as: 'jobNature',
            }
          ]
        };
      },
      includeUser: function () {
        return {
          include: [
            {
              model: sequelize.models.User, as: 'user',
            }
          ]
        };
      },
      includeExpectPosition: function () {
        return {
          include: [
            {
              model: sequelize.models.PositionCategory, as: 'expectPosition'
            }
          ]
        };
      },
      includeLocation: function () {
        return {
          include: [
            {
              model: sequelize.models.Location, as: 'location'
            }
          ]
        };
      }
    },
  });

  // Class Method
  Model.getEditableKeys = function () {
    return ['userId', 'locationId', 'type', 'expectPositionId', 'salaryType', 'minSalary', 'maxSalary', 'content'];
  };
  Model.associate = function (models) {
    Model.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });

    Model.belongsTo(models.Location, {
      targetKey: 'id',
      foreignKey: 'locationId',
      as: 'location'
    });

    Model.belongsTo(models.JobNature, {
      targetKey: 'id',
      foreignKey: 'jobNatureId',
      as: 'jobNature'
    });

    Model.belongsTo(models.PositionCategory, {
      targetKey: 'id',
      foreignKey: 'expectPositionId',
      as: 'expectPosition'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

