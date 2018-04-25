'use strict';
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Tag', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    suggest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }
  }, {
    charset: 'utf8',
    timestamps: false,
    freezeTableName: true,
    hooks: {},
    getterMethods: {},
    setterMethods: {},
    scopes: {
      includePosition: function () {
        const expiredDate = moment().format('YYYY-MM-DD');
        return {
          include: [
            {
              model: sequelize.models.Position, as: 'positions',
              through: {
                model: sequelize.models.Taggable, as: 'taggable',
                where: {
                  type: {$in:['PositionTag','PositionSkill']},
                },
                attributes:[],
              },
              where:{
                active:true,
                expiredDate: {$gte: expiredDate}
              },
              required: true,
              attributes:[],
            }
          ]
        };
      },
      includePost: function () {
        return {
          include: [
            {
              model: sequelize.models.Post, as: 'posts',
              where:{
                isApproved:true
              },
              required: true,
              attributes:[],
              through: {
                model: sequelize.models.Taggable, as: 'taggable',
                where: {
                  type: 'PostTag',
                },
                attributes:[],
              }
            }
          ]
        };
      },
    },
  });

  // Class Method
  Model.associate = function (models) {
    Model.hasMany(models.Taggable, {
      targetKey: 'id',
      foreignKey: 'tagId',
      onDelete: 'cascade',
      as: 'taggables'
    });

    Model.belongsToMany(models.Post, {
      constraints: false,
      foreignKey: 'tagId',
      otherKey: 'taggableId',
      through: {model: models.Taggable, as: 'taggable', unique: false},
      as: 'posts'
    });
    Model.belongsToMany(models.Position, {
      constraints: false,
      foreignKey: 'tagId',
      otherKey: 'taggableId',
      through: {model: models.Taggable, as: 'taggable', unique: false},
      as: 'positions'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
