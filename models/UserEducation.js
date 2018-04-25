'use strict';
let moment = require('moment');
let _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('UserEducation', {
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
    educationLevelId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    schoolId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gpa: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: true,
    },
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    hooks: {
      beforeCreate: function (model, options) {
        // remove TIME
        _.each(['startedDate', 'endedDate'], function (item) {
          if (model[item]) model[item] = moment.utc(model[item]).startOf('day').toISOString();
        });
      },
      beforeUpdate: function (model, options) {
        // remove TIME
        _.each(['startedDate', 'endedDate'], function (item) {
          if (model[item]) model[item] = moment.utc(model[item]).startOf('day').toISOString();
        });
      }
    },
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {
      includeEducationLevel: function () {
        return {
          include: [
            {
              model: sequelize.models.EducationLevel, as: 'educationLevel',
            }
          ]
        };
      },
      includeSchools: function () {
        return {
          include: [
            {
              model: sequelize.models.School, as: 'school',
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
    },
  });

  // Class Method
  Model.getEditableKeys = function () {
    return ['userId', 'educationLevelId', 'schoolId', 'subject', 'remark', 'graduationYear','gpa'];
  };
  Model.associate = function (models) {
    Model.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });
    Model.belongsTo(models.EducationLevel, {
      targetKey: 'id',
      foreignKey: 'educationLevelId',
      onDelete: 'restrict',
      as: 'educationLevel'
    });
    Model.belongsTo(models.School, {
      targetKey: 'id',
      foreignKey: 'schoolId',
      onDelete: 'restrict',
      as: 'school'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
