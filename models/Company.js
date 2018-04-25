'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Company', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    countryId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    enterpriseId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    foundingTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    scale: {
      type: DataTypes.ENUM('myself-only', '2-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+'),
      allowNull: true
    },
    field: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stage: {
      type: DataTypes.ENUM('public-company', 'educational', 'self-employed', 'government-agency', 'non-profit', 'self-owned', 'privately-held', 'partnership'),
      allowNull: true
    },
    background: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isVIP: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    view: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
      includeCompanyPictures: function () {
        return {
          include: [{
            model: sequelize.models.CompanyPicture,
            as: 'pictures',
            required: false,
            where: {
              isIcon: false,
              isCover: false,
            },
          }]
        };
      },
      includeCover: function () {
        return {
          include: [{
            model: sequelize.models.CompanyPicture,
            as: 'cover',
            required: false,
            where: {
              isCover: true,
            },
          }]
        };
      },
      includeIcon: function () {
        return {
          include: [{
            model: sequelize.models.CompanyPicture,
            as: 'icon',
            required: false,
            where: {
              isIcon: true,
            },
          }]
        };
      },
      includeCountry: function () {
        return {
          include: [{
            model: sequelize.models.Country,
            as: 'country'
          }]
        };
      },      
      includeCompanyInterlocutor: function () {
        return {
          include: [{
            attributes:['id'],
            model: sequelize.models.ChatInterlocutor,
            as: 'companyInterlocutor',
            required:false
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
      case 'user':
        return attributes;
      case 'enterprise':
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
        return [];
      case 'enterprise':
        return _.without(attributes, 'enterpriseId', 'isApproved');
      case 'public':
        return [];
      case 'admin':
        return attributes;
    }
  };
  Model.associate = function (models) {
    Model.belongsTo(models.Country, {
      targetKey: 'id',
      foreignKey: 'countryId',
      onDelete: 'cascade',
      as: 'country'
    });

    Model.belongsTo(models.Enterprise, {
      targetKey: 'id',
      foreignKey: 'enterpriseId',
      onDelete: 'cascade',
      as: 'enterprise'
    });

    Model.hasMany(models.Position, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'positions'
    });

    Model.hasMany(models.CompanyPicture, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'pictures',
    });

    Model.hasOne(models.CompanyPicture, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'icon',
    });

    Model.hasOne(models.CompanyPicture, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'cover',
    });

    Model.belongsToMany(models.User, {
      foreignKey: 'companyId',
      through: {model: models.UserCompany, as: 'userCompany'},
      as: 'users'
    });

    Model.hasMany(models.Review, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'reviews'
    });

    Model.hasMany(models.CompanyDynamic, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'companyDynamics'
    });

    Model.hasMany(models.CompanyAward, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'companyAwards'
    });

    Model.hasMany(models.CompanyWelfare, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'companyWelfares'
    });
    Model.hasMany(models.CompanyFile, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'files',
    });
    Model.hasOne(models.ChatInterlocutor, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'companyInterlocutor'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };

  return Model;
};
