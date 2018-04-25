'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Position', {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    locationId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    jobNatureId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    postedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expiredDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('full-time', 'part-time', 'internship', 'freelance', 'others'),
      allowNull: false,
      defaultValue: 'full-time'
    },
    salaryType: {
      type: DataTypes.ENUM('hourly', 'monthly', 'yearly'),
      allowNull: true,
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
    educationLevelId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    experience: {
      type: DataTypes.ENUM('0', '0.5', '1', '2', '3', '4', '5', '5+'),
      allowNull: false,
      defaultValue: '0'
    },
    temptation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    view: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    hooks: {
      afterDestroy: function (position, options) {
        return position.update({active: false}, {where: {id: position.id}, individualHooks: true});
      }
    },
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {
      includePositionTagsWithSearch: function (keyword) {
        let orCondition = [];
        _.each(keyword, function (val) {
          orCondition.push(val.id)
        });
        return {
          include: [
            {
              model: sequelize.models.Tag, as: 'tagsSearch',
              through: {
                model: sequelize.models.Taggable, as: 'tag',
                where: {
                  type: {$in:['PositionTag','PositionSkill']},
                  tagId: {
                    $in: orCondition
                  }
                }
              },
              where: {
                id: {
                  $in: orCondition
                }
              },
              required: true
            }
          ]
        };
      },
      includeCategoriesWithSearch: function (categoryIds) {
        if (!_.isArray(categoryIds)) categoryIds = [categoryIds];
        return {
          include: [
            {
              model: sequelize.models.PositionCategory, as: 'categoriesSearch',
              through: {
                model: sequelize.models.PositionCategoryMap, as: 'positionCategoryMap',
                where: {
                  positionCategoryId: {
                    $in: categoryIds
                  }
                }
              },
              where: {
                id: {
                  $in: categoryIds
                }
              }
            }
          ]
        };
      },
      includeIndexCompanyWithSearch: function () {
        return {
          include: [
            {
              model: sequelize.models.Company, as: 'company', paranoid: true,
              attributes:[],
              where: {
                isApproved: true,
              },
            }
          ]
        };
      },
      includeIndexCompany: function () {
        return {
          include: [
            {
              model: sequelize.models.Company, as: 'company', paranoid: true,
              required: false,
              attributes:['id','isVIP','url'],
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
                },
                {
                  model: sequelize.models.CompanyPicture, as: 'cover',
                  required: false,
                  where: {
                    isCover: true,
                  }
                }
              ]
            }
          ]
        };
      },
      includeEducation: function () {
        return {
          include: [
            {
              model: sequelize.models.EducationLevel, as: 'educationLevel',
              attributes:['name','id']
            }
          ]
        };
      },
      includeLocation: function () {
        return {
          include: [
            {
              model: sequelize.models.Location, as: 'locations',
              attributes:['name','id','parentId']
            }
          ]
        };
      },
      attribute: function (data) {
        return {
          attributes: {
            include: data
          }
        };
      },
      includeJobNature: function () {
        return {
          include: [
            {
              model: sequelize.models.JobNature, as: 'jobNatures',
              attributes:['id','name']
            }
          ]
        };
      },
      includePositionSkills: function () {
        return {
          include: [
            {
              model: sequelize.models.Tag, as: 'skills',
              attributes:['id','name'],
              through: {
                model: sequelize.models.Taggable, as: 'taggable',
                where: {
                  type: 'PositionSkill',
                },
                attributes:[],
              },
              required: false,
            }
          ]
        };
      },
      includePositionTags: function () {
        return {
          include: [
            {
              model: sequelize.models.Tag, as: 'tags',
              attributes:['id','name'],
              through: {
                model: sequelize.models.Taggable, as: 'tag',
                where: {
                  type: {$in:['PositionTag','PositionSkill']},
                },
                attributes:[],
              },
              required: false,
            }
          ]
        };
      },
      includeCategories: function () {
        return {
          include: [
            {
              model: sequelize.models.PositionCategory, as: 'categories',
              through: {model: sequelize.models.PositionCategoryMap, as: 'positionCategoryMap',attributes:[]},
              attributes:['id','name','parentId']
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
                },
                {
                  model: sequelize.models.CompanyPicture, as: 'cover',
                  required: false,
                  where: {
                    isCover: true,
                  },
                }
              ]
            }
          ]
        };
      },
      includeCandidates: function () {
        return {
          include: [
            {
              model: sequelize.models.Candidate, as: 'candidates',
              include: [
                {
                  model: sequelize.models.CandidateQuestion, as: 'candidateQuestions',
                }
              ]
            }
          ]
        };
      },
      includePositionQuestion: function () {
        return {
          include: [
            {
              model: sequelize.models.PositionQuestion, as: 'questions'
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
              model: sequelize.models.User,
              as: 'user'
            }]
          }]
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
      case 'index':
        return attributes;
      case 'public':
        return attributes;
      case 'enterprise':
        return _.without(attributes, 'postedDate');
      case 'admin':
        return attributes;
    }
  };
  Model.getEditAttributesByRole = function (roleName) {
    let attributes = this.getAttributes();
    switch (roleName) {
      case 'user':
        return _.without(attributes, 'postedDate', 'expiredDate');
      case 'enterprise':
        return _.without(attributes, 'postedDate', 'expiredDate');
      case 'public':
        return [];
      case 'admin':
        return attributes;
    }
  };
  Model.associate = function (models) {
    Model.belongsTo(models.Company, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'company'
    });

    Model.belongsTo(models.EducationLevel, {
      targetKey: 'id',
      foreignKey: 'educationLevelId',
      onDelete: 'cascade',
      as: 'educationLevel'
    });

    Model.belongsTo(models.Location, {
      targetKey: 'id',
      foreignKey: 'locationId',
      onDelete: 'RESTRICT',
      as: 'locations'
    });

    Model.belongsTo(models.JobNature, {
      targetKey: 'id',
      foreignKey: 'jobNatureId',
      onDelete: 'RESTRICT',
      as: 'jobNatures'
    });

    Model.hasMany(models.Candidate, {
      targetKey: 'id',
      foreignKey: 'positionId',
      onDelete: 'cascade',
      as: 'candidates'
    });

    Model.belongsToMany(models.PositionCategory, {
      foreignKey: 'positionId',
      through: {model: models.PositionCategoryMap, as: 'positionCategoryMap'},
      otherKey: 'positionCategoryId',
      as: 'categories'
    });

    Model.belongsToMany(models.PositionCategory, {
      foreignKey: 'positionId',
      through: {model: models.PositionCategoryMap, as: 'positionCategoryMap'},
      otherKey: 'positionCategoryId',
      as: 'categoriesSearch'
    });

    Model.hasMany(models.PositionQuestion, {
      targetKey: 'id',
      foreignKey: 'positionId',
      onDelete: 'cascade',
      as: 'questions'
    });

    Model.belongsToMany(models.User, {
      foreignKey: 'positionId',
      through: {model: models.Bookmark, as: 'bookmark',unique: false},
      as: 'bookmarks'
    });

    Model.belongsToMany(models.Tag, {
      constraints: false,
      foreignKey: 'taggableId',
      otherKey: 'tagId',
      through: {model: models.Taggable, as: 'taggable', unique: false},
      as: 'skillsSearch'
    });

    Model.belongsToMany(models.Tag, {
      constraints: false,
      foreignKey: 'taggableId',
      otherKey: 'tagId',
      through: {model: models.Taggable, as: 'taggable', unique: false},
      as: 'tagsSearch'
    });

    Model.belongsToMany(models.Tag, {
      constraints: false,
      foreignKey: 'taggableId',
      otherKey: 'tagId',
      through: {model: models.Taggable, as: 'taggable', unique: false},
      as: 'skills'
    });

    Model.belongsToMany(models.Tag, {
      constraints: false,
      foreignKey: 'taggableId',
      otherKey: 'tagId',
      through: {model: models.Taggable, as: 'taggable', unique: false},
      as: 'tags'
    });


    Model.hasMany(models.Review, {
      targetKey: 'id',
      foreignKey: 'positionId',
      onDelete: 'cascade',
      as: 'reviews'
    });

  };

  // Instance Method
  Model.prototype.toJSON = function () {
    let res = this.dataValues;

    // hide field
    if (typeof res.categoriesSearch !== 'undefined') delete res.categoriesSearch;
    if (typeof res.tagsSearch !== 'undefined') delete res.tagsSearch;

    return res;
  };
  return Model;
};

