'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('ChatInterlocutor', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    companyId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    scopes:{
      includeUser: ()=> {
        return {
          include: [{
            model: sequelize.models.User, as: 'user',
            include: [{
              model: sequelize.models.UserPicture,
              as: 'icon',
              required: false,
              where: {
                isIcon: true,
              },
            }]
          }]
        }
      },
      includeCompany: ()=> {
        return {
          include: [{
            model: sequelize.models.Company, as: 'company',
            include: [{
              model: sequelize.models.CompanyPicture,
              as: 'icon',
              required: false,
              where: {
                isIcon: true,
              },
            }]
          }]
        }
      },
    }
  });
  
  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
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
    return  this.dataValues;
  };
  return Model;
};

