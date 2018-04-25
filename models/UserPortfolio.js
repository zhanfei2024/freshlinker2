'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('UserPortfolio', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {
      includeUser: function () {
        return {
          include: [
            {
              model: sequelize.models.User, as: 'user',
            }
          ]
        };
      },
      includePictures: function () {
        return {
          include: [
            {
              model: sequelize.models.UserPortfolioPicture, as: 'pictures'
            }
          ]
        };
      },
    },
  });

  // Class Method
  Model.getEditableKeys = function () {
    return ['userId', 'userPortfolioPictureId', 'title', 'description', 'url'];
  };
  Model.associate = function (models) {
    Model.hasMany(models.UserPortfolioPicture, {
      targetKey: 'id',
      foreignKey: 'portfolioId',
      onDelete: 'cascade',
      as: 'pictures'
    });
    Model.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

