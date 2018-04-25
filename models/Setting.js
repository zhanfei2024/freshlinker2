'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Setting', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    global: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: '{}'
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
  Model.getEditableKeys = function () {
    return ['name', 'url', 'imageUrl', 'order'];
  };
  Model.initSeed = function () {
    let data = [
      {"id":1,"global":{'name': '名称', 'url': '访问地址', 'imageUrl': '图片地址', 'order': 1}},
      {"id":2,"global":[
        {
          "name": "lite",
          "displayName": "LITE",
          "description": "Launch Offer",
          "active": true,
          "meta": {
            "positionQuota": 2,
            "positionEffectiveDay": 90,
            "price": 0,
            "oldPrice": 800,
            "allowRepeatBuy": false
          }
        },
        {
          "name": "standard",
          "displayName": "STANDARD",
          "description": "Launch Offer (20%off)",
          "active": true,
          "meta": {
            "positionQuota": 5,
            "positionEffectiveDay": 90,
            "price": 1400,
            "oldPrice": 1750,
            "allowRepeatBuy": true
          }
        },
        {
          "name": "professional",
          "displayName": "PROFESSIONAL",
          "description": "Launch Offer (20%off)",
          "active": true,
          "meta": {
            "positionQuota": 8,
            "positionEffectiveDay": 90,
            "price": 1920,
            "oldPrice": 2400,
            "allowRepeatBuy": true
          }

        },
        {
          "name": "premium",
          "displayName": "PREMIUM",
          "description": "Launch Offer (20%off)",
          "active": true,
          "meta": {
            "positionQuota": 12,
            "positionEffectiveDay": 90,
            "price": 2800,
            "oldPrice": 3500,
            "allowRepeatBuy": true
          }
        },
        {
          "name": "enterprise",
          "displayName": "ENTERPRISE",
          "active": true,
          "description": "Custom Enterprise solutions to fit your needs"
        }
      ]}
    ];
    return Model.bulkCreate(data);
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    let res = this.dataValues;

    // hide field
    delete res.appId;

    return res;
  };
  return Model;
};
