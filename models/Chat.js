'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Chat', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    interlocutorId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    anotherId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    isEnter: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    scopes:{
      includeInterlocutor: () =>{
        return {
          include:[{
            model: sequelize.models.ChatInterlocutor,
            as:'interlocutor',
            include:[
              {
                model: sequelize.models.User, as: 'user',
                required: false,
                include: [{
                  model: sequelize.models.UserPicture,
                  as: 'icon',
                  required: false,
                  where: {
                    isIcon: true,
                  },
                }]
              },
              {
                model: sequelize.models.Company, as: 'company',
                required: false,
                include: [{
                  model: sequelize.models.CompanyPicture,
                  as: 'icon',
                  required: false,
                  where: {
                    isIcon: true,
                  },
                }]
              }
            ]
          }]
        }
      },
      includeAnother: () =>{
        return {
          include:[{
            model: sequelize.models.ChatInterlocutor,
            as:'another',
            include:[
              {model: sequelize.models.User, as: 'user',
                required: false,
                include: [
                  {
                    model: sequelize.models.UserPicture,
                    as: 'icon',
                    required: false,
                    where: {
                      isIcon: true,
                    },
                  }
                ]},
              {model: sequelize.models.Company, as: 'company',
                required: false,
                include: [
                  {
                    model: sequelize.models.CompanyPicture,
                    as: 'icon',
                    required: false,
                    where: {
                      isIcon: true,
                    },
                  }
                ]}
            ]
          }]
        }
      }
    }
  });

  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.associate = function (models) {
    Model.belongsTo(models.ChatInterlocutor, {
      targetKey: 'id',
      foreignKey: 'interlocutorId',
      onDelete: 'cascade',
      as: 'interlocutor'
    });
    Model.belongsTo(models.ChatInterlocutor, {
      targetKey: 'id',
      foreignKey: 'anotherId',
      onDelete: 'cascade',
      as: 'another'
    });
  };
  // Instance Method
  Model.prototype.toJSON = function () {
    return  this.dataValues;
  };
  return Model;
};

