'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Candidate', {
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
      candidateStatusId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      positionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      appliedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      isInvitation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isInterviewed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      charset: 'utf8',
      timestamps: true,
      freezeTableName: true,
      getterMethods: {},
      setterMethods: {},
      defaultScope: {},
      scopes: {
        includeCandidateStatus: function () {
          return {
            include: [
              {
                model: sequelize.models.CandidateStatus, as: 'candidateStatus',
              }
            ]
          };
        },
        includeCandidateQuestions: function () {
          return {
            include: [
              {
                model: sequelize.models.CandidateQuestion, as: 'candidateQuestions',
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
        includePosition: function () {

          return {
            include: [
              {
                model: sequelize.models.Position, as: 'position', paranoid: true,
                require: false,
                include: [
                  {
                    model: sequelize.models.EducationLevel, as: 'educationLevel'
                  },
                  {
                    model: sequelize.models.Tag, as: 'skills',
                    through: {
                      model: sequelize.models.Taggable, as: 'taggable',
                      where: {
                        type: 'PositionSkill',
                      }
                    },
                    required: false,
                  }
                ]
              }
            ]
          };
        },
        includePositionWithSearch: function (filter) {

          return {
            include: [
              {
                model: sequelize.models.Position, as: 'position', paranoid: true,
                include: [
                  {
                    model: sequelize.models.EducationLevel, as: 'educationLevel'
                  },
                  {
                    model: sequelize.models.Tag, as: 'skills',
                    through: {
                      model: sequelize.models.Taggable, as: 'taggable',
                      where: {
                        type: 'PositionSkill',
                      }
                    },
                    required: false,
                  }
                ],
                where: {
                  name: { $iLike: `%${filter}%` },
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
                  {model: sequelize.models.Language, as: 'languages'},
                  {model: sequelize.models.UserExperience, as: 'experiences'},
                  {model: sequelize.models.UserPortfolio, as: 'portfolios'},
                  {model: sequelize.models.UserExpectJob, as: 'expectJobs'},
                  {
                    model: sequelize.models.UserPicture, as: 'icon',
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
    switch (roleName){
      case 'user':
        return _.without(attributes,'isRead');
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
    Model.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });

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

    Model.belongsTo(models.CandidateStatus, {
      targetKey: 'id',
      foreignKey: 'candidateStatusId',
      onDelete: 'cascade',
      as: 'candidateStatus'
    });

    Model.hasMany(models.CandidateQuestion, {
      targetKey: 'id',
      foreignKey: 'candidateId',
      onDelete: 'cascade',
      as: 'candidateQuestions'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

