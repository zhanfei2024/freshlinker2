'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('UserCompany', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    status: {
      type: DataTypes.ENUM('fail','pass','pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
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
              include: [
                {
                  model: sequelize.models.UserPicture, as: 'icon',
                  required: false,
                  where: {
                    isIcon: true,
                  },
               }
              ],
            }
          ]
        };
      },
      includeCompany: function () {
        return {
          include: [
            {
              model: sequelize.models.User, as: 'user',
              include: [
                {
                  model: sequelize.models.UserPicture, as: 'icon',
                  required: false,
                  where: {
                    isIcon: true,
                  },
                }
              ],
            }
          ]
        };
      },
    },
  });

  // Class Method
  Model.associate = function (models) {
    Model.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });
    Model.belongsTo(models.Company, {
      targetKey: 'id',
      foreignKey: 'companyId',
      onDelete: 'cascade',
      as: 'company'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

