'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Taggable', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    tagId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    taggableId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    charset: 'utf8',
    timestamps: false,
    freezeTableName: true,
    hooks: {},
    getterMethods: {},
    setterMethods: {},
  });

  // Class Method
  Model.associate = function (models) {
    Model.belongsTo(models.Tag, {
      targetKey: 'id',
      foreignKey: 'tagId',
      onDelete: 'cascade',
      as: 'tag'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
