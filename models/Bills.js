'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Bills', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    enterpriseId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currency: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0
    },
    type: {
      type: DataTypes.ENUM('invitation', 'liberties'),
      allowNull: true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    billedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    getterMethods: {},
    setterMethods: {},
    scopes: {
      includeEnterprise: function () {
        return {
          include: [
            {
              model: sequelize.models.Enterprise, as: 'enterprise',
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
  Model.associate = function (models) {
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


