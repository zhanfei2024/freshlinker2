'use strict';

// library
const _ = require('lodash');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    profilePictureId: {
      type: DataTypes.BIGINT,
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
    gender: {
      type: DataTypes.ENUM('M', 'F'),
      allowNull: true,
    },
    birth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nationalityId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    yearOfExperience: {
      type: DataTypes.ENUM('0', '0.5', '1', '2', '3', '4', '5', '5+'),
      allowNull: true,
    },
    selfDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    profilePrivacy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    hooks: {
      beforeUpdate: function (model, options) {
      }
    },
    getterMethods: {
      fullName: function () {
        return this.firstName + ' ' + this.lastName;
      },
    },
    setterMethods: {},
    defaultScope: {},
    scopes: {
      includeUserExperiences: function () {
        return {
          include: [
            {
              model: sequelize.models.UserExperience, as: 'experiences',
            }
          ],
          order: [
            [
              {model: sequelize.models.UserExperience, as: 'experiences'},
              'endedDate', 'desc'
            ]
          ],
        };
      },
      includeUserLanguages: function () {
        return {
          include: [
            {
              model: sequelize.models.Language, as: 'languages',
            }
          ]
        };
      },
      includeUserEducations: function () {
        return {
          include: [
            {
              model: sequelize.models.UserEducation, as: 'educations',
              include: [
                {model: sequelize.models.School, as: 'school',},
                {model: sequelize.models.EducationLevel, as: 'educationLevel'}
              ]
            }
          ]
        };
      },
      includeUserSkills: function () {
        return {
          include: [
            {
              model: sequelize.models.Tag, as: 'skills',
              through: {
                model: sequelize.models.Taggable, as: 'taggable',
                where: {
                  type: 'UserSkill',
                }
              },
              required: false,
            }
          ]
        };
      },
      includeUserPortfolios: function () {
        return {
          include: [
            {
              model: sequelize.models.UserPortfolio, as: 'portfolios',
              include: [
                {
                  model: sequelize.models.UserPortfolioPicture, as: 'pictures'
                }
              ]
            }
          ]
        };
      },
      includeUserExpectJobs: function () {
        return {
          include: [
            {
              model: sequelize.models.UserExpectJob, as: 'expectJobs',
              include: [
                {
                  model: sequelize.models.PositionCategory, as: 'expectPosition'
                },
                {
                  model: sequelize.models.Location, as: 'location'
                },
              ]
            }
          ]
        };
      },
      includeUserPictures: function () {
        return {
          include: [
            {
              model: sequelize.models.UserPicture, as: 'pictures',
              required: false,
              where: {
                isIcon: false,
              },
            }
          ]
        };
      },
      includeIcon: function () {
        return {
          include: [
            {
              model: sequelize.models.UserPicture, as: 'icon',
              required: false,
              where: {
                isIcon: true,
              },
            }
          ]
        };
      },
      includeFile: function () {
        return {
          include: [
            {
              model: sequelize.models.UserFile, as: 'resume',
              required: false
            }
          ]
        };
      },
      includeCompanies: function () {
        return {
          include: [
            {
              model: sequelize.models.Company, as: 'companies',
              through: {
                model: sequelize.models.UserCompany, as: 'userCompanies',
                where:{
                  status: 'pass',
                }
              },
              required: false,
            }
          ]
        };
      },
      includeReviews: function () {
        return {
          include: [{
            model: sequelize.models.Review,
            as: 'reviews',
            include: [{
              model: sequelize.models.Company,
              as: 'company'
            },
              {
                model: sequelize.models.Position,
                as: 'position'
              }]
          }]
        };
      },
      includeUserInterlocutor: function () {
        return {
          include: [{
            attributes:['id'],
            model: sequelize.models.ChatInterlocutor,
            as: 'userInterlocutor',
            required:false
          }]
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
    Model.hasMany(models.UserEducation, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'educations'
    });

    Model.hasMany(models.UserExperience, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'experiences'
    });

    Model.hasMany(models.UserPortfolio, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'portfolios'
    });

    Model.hasMany(models.UserExpectJob, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'expectJobs'
    });

    Model.belongsToMany(models.Language, {
      foreignKey: 'userId',
      through: {model: models.UserLanguage, as: 'userLanguage'},
      as: 'languages'
    });

    Model.hasMany(models.UserLanguage, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'userLanguages'
    });

    Model.hasMany(models.UserPicture, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'pictures'
    });

    Model.hasOne(models.UserPicture, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'icon',
    });

    Model.hasOne(models.UserFile, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'resume',
    });

    Model.hasMany(models.PositionInvitation, {
      targetKey: 'id',
      foreignKey: 'userId',
      as: 'positionInvitations',
      onDelete: 'cascade',
    });

    Model.belongsToMany(models.Tag, {
      constraints: false,
      foreignKey: 'taggableId',
      otherKey: 'tagId',
      through: {model: models.Taggable, as: 'taggable', unique: false},
      as: 'skills'
    });

    Model.belongsToMany(models.Position, {
      foreignKey: 'userId',
      through: {model: models.Bookmark, as: 'bookmark', unique: false},
      as: 'bookmarks'
    });

    Model.belongsToMany(models.Company, {
      foreignKey: 'userId',
      through: {model: models.UserCompany, as: 'userCompany'},
      as: 'companies'
    });

    Model.hasMany(models.Review, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'reviews'
    });
    Model.hasOne(models.ChatInterlocutor, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'userInterlocutor'
    });

  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
