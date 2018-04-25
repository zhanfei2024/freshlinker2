'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('AuthenticationProvider', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    enterpriseId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    authenticationProviderTypeId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
  }, {
    charset: 'utf8',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      {fields: ['id', 'authenticationProviderTypeId']}
    ],
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {},
  });

  // Class Method
  Model.associate = function (models) {
    Model.belongsTo(models.AuthenticationProviderType,{
      targetKey: 'id',
      foreignKey: 'authenticationProviderTypeId',
      onDelete: 'restrict',
      as: 'type'
    });
    Model.belongsTo(models.User,{
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });
    Model.belongsTo(models.Enterprise,{
      targetKey: 'id',
      foreignKey: 'enterpriseId',
      onDelete: 'cascade',
      as: 'enterprise'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
