'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('UserLanguage', {
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
    languageId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM('elementary', 'limited_working', 'professional_working', 'full_professional', 'native'),
      allowNull: false,
      defaultValue: 'elementary'
    },
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    classMethods: {
      getAttributes: function () {
        return ['languageId', 'level'];
      },
      associate: function (models) {
        Model.belongsTo(models.User, {
          targetKey: 'id',
          foreignKey: 'userId',
          onDelete: 'cascade',
          as: 'user'
        });

        Model.belongsTo(models.Language, {
          targetKey: 'id',
          foreignKey: 'languageId',
          onDelete: 'cascade',
          as: 'languages'
        });
      }
    },
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {
      includeLanguage: function () {
        return {
          include: [
            {
              model: sequelize.models.Language, as: 'languages'
            }
          ]
        };
      }
    },
    instanceMethods: {
      toJSON: function () {
        let res = this.dataValues;

        // hide field

        return res;
      }
    }
  });

  // Class Method
  Model.getAttributes = function () {
    return ['languageId', 'level'];
  };
  Model.associate = function (models) {
    Model.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });

    Model.belongsTo(models.Language, {
      targetKey: 'id',
      foreignKey: 'languageId',
      onDelete: 'cascade',
      as: 'languages'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};
