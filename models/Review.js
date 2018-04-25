'use strict';
module.exports = function(sequelize,DataTypes){
  const Model = sequelize.define('Review',{
    id:{
      type:DataTypes.BIGINT,
      allowNull:false,
      autoIncrement:true,
      primaryKey:true,
    },
    userId:{
      type: DataTypes.BIGINT,
      allowNull: false
    },
    companyId:{
      type: DataTypes.BIGINT,
      allowNull: false
    },
    positionId:{
      type: DataTypes.BIGINT,
    },
    isAnonymous:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    content:{
      type: DataTypes.TEXT,
      allowNull: true
    },
    view: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isRead:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },{
    charset:'utf-8',
    timestamps:true,
    freezeTableName:true,
    getterMethods: {},
    setterMethods: {},
    defaultScope: {},
    scopes: {
      attribute: function (data) {
        return {
          attributes: {
            include: data
          }
        };
      },
      sorting: function (type) {
        let sort;
        let attribute;
        switch (type) {
          case 'newest':
            sort = [['updatedAt', 'DESC']];
            attribute = 'updatedAt';
            break;
          case 'popular':
            sort = [['view', 'DESC']];
            attribute = 'view';
            break;
          case 'featured':
            sort = [['isFeatured', 'DESC']];
            attribute = 'isFeatured';
            break;
          default:
            sort = [['updatedAt', 'DESC']];
            attribute = 'updatedAt';
            break;
        }
        return {
          attributes: {
            include: attribute
          },
          order: sort
        };
      },
      includeUser: function () {
        return {
          include: [
            {
              attributes: ['id', 'lastName', 'firstName', 'email','selfDescription'],
              model: sequelize.models.User, as: 'user',
              required: false,
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
              model: sequelize.models.Company, as: 'company', paranoid: true,
              required: true
            }
          ]
        };
      },
      includePosition: function () {
        return {
          include: [
            {
              model: sequelize.models.Position, as: 'position', paranoid: true,
              required: false
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
  Model.associate = function(models){
    Model.belongsTo(models.User,{
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
    Model.belongsTo(models.Position, {
      targetKey: 'id',
      foreignKey: 'positionId',
      onDelete: 'cascade',
      as: 'position'
    });
  };
  // Instance Method
  Model.prototype.toJSON = function () {
    let res = this.dataValues;

    if(res.isAnonymous) delete res.userId;
    return res;
  };

  return Model;
};
