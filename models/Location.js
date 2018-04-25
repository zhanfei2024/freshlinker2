'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Location', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    parentId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    depth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    charset: 'utf8',
    timestamps: false,
    freezeTableName: true,
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {
      includeLocation: function () {
        return {
          include: [{
            model: sequelize.models.Location, as: 'locations',
          }]
        }
      }
    },
    hierarchy: {
      freezeTableName: true,
      camelThrough: true,
      as: 'parent',
      levelFieldName: 'depth'
    }
  });

  // Class Method
  Model.getEditableKeys = function () {
    return ['parentId', 'depth', 'name'];
  };
  Model.associate = function (models) {
    Model.hasMany(models.Position, {
      targetKey: 'id',
      foreignKey: 'locationId',
      onDelete: 'RESTRICT',
      as: 'positions'
    });

    Model.hasMany(models.Location, {
      foreignKey: 'parentId',
      as: 'locations',
    });
  };
  Model.findAllByIdAndFilterHasNotChildren = async function(ids) {
    if (!_.isArray(ids)) ids = [ids];

    let locations = await Model.findAll({
      where: {id: ids},
      include: {model: Model, as: 'locations'}
    });
    return _.filter(locations, function (val) {
      return val.locations.length === 0;
    });
  };

  Model.findAllByIdAndFilterHasChildren = async function(ids) {
    if (!_.isArray(ids)) ids = [ids];

    let locations = await Model.findAll({
      where: {id: ids},
      include: {model: Model, as: 'children'}
    });

    let locationIds = [];
    _.forEach(locations, function (location) {
      if (location.children.length !== 0) {
        _.forEach(location.children, function (val) {
          locationIds.push(val.id);
        });
      }else {
        locationIds.push(location.id);
      }
    });

    return locationIds;
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
