'use strict';

const _ = require('lodash');


module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('PostCategory', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    parentId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    depth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    getterMethods: {},
    setterMethods: {},
    hierarchy: {
      freezeTableName: true,
      camelThrough: true,
      as: 'parent',
      levelFieldName: 'depth'
    }
  });
  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.associate = function (models) {
    Model.belongsToMany(models.Post, {
      foreignKey: 'postCategoryId',
      through: {model: models.PostCategoryMap, as: 'postCategoryMap'},
      as: 'posts'
    });
  };
  Model.findAllByIdAndFilterHasNotChildren = async function(ids) {
    if (!_.isArray(ids)) ids = [ids];

    let categories = await Model.findAll({
      where: {id: ids},
      include: {model: Model, as: 'children'}
    });
    return _.filter(categories, function (val) {
      return val.children.length === 0;
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

