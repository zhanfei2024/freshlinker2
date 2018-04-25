'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Plan', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    features: {
      type: DataTypes.STRING,
      allowNull: true
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: '{}'
    },
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    getterMethods: {},
    setterMethods: {},
  });

  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.initSeed = function () {
    let data = [
      {
        "id":1,
        "name": "one month",
        "displayName": "One Month",
        "description": "",
        "features": "(60%off)",
        "active": true,
        "meta": {
          "price": 599.2,
          "oldPrice": 1498,
          "planEffectiveDay": 30,
          "allowRepeatBuy": false
        }
      },
      {
        "id":2,
        "name": "three month",
        "displayName": "Three Month",
        "description": "(for the price of 2.8,instead of 3)",
        "features": "(60%off)",
        "active": true,
        "meta": {
          "price": 1677.7,
          "oldPrice": 4194.4,
          "planEffectiveDay": 90,
          "allowRepeatBuy": false
        }
      },
      {
        "id":3,
        "name": "six month",
        "displayName": "Six Month",
        "description": "(for the price of 5.5,instead of 6)",
        "features": "(60%off)",
        "active": true,
        "meta": {
          "price": 3239.6,
          "oldPrice": 8239,
          "planEffectiveDay": 180,
          "allowRepeatBuy": false
        }
      },
      {
        "id":4,
        "name": "annual package",
        "displayName": "Annual Package",
        "description": "(for the price of 10,instead of 12)",
        "features": "(60%off)",
        "active": true,
        "meta": {
          "price": 5992,
          "oldPrice": 14980,
          "planEffectiveDay": 360,
          "allowRepeatBuy": false
        }
      }
    ];
    return Model.bulkCreate(data, {returning: true});
  };
  Model.associate = function (models) {
    Model.hasMany(models.Enterprise, {
      targetKey: 'id',
      foreignKey: 'planId',
      onDelete: 'cascade',
      as: 'enterprises'
    });
  };

// Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
