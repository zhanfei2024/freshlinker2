'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('CompanyDynamic', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    positionId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    postId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    reviewId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    view: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }

  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
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

      includeCompanyDynamicPictures: function () {
        return {
          include: [{
            model: sequelize.models.CompanyDynamicPicture,
            as: 'pictures',
            required: false,
          }]
        };
      },

      includePosition: function () {
        return {
          include: [{
            model: sequelize.models.Position,
            as: 'position',
            required: false,
            include:[
              {
                model:sequelize.models.Location,
                as:'locations',
              },
              {
                model: sequelize.models.PositionCategory,
                through:{model:sequelize.models.PositionCategoryMap,as:'positionCategoryMap'},
                as: 'categories'
              }
            ],
          }]
        };
      },
      includePost: function () {
        return {
          include: [{
            model: sequelize.models.Post,
            as: 'post',
            required: false,
            include: [
              {
                model: sequelize.models.PostImage, as: 'cover',
                attributes: ['id', 'key', 'extension', 'postId'],
                required: false,
                where: {
                  isCover: true,
                },
              }
            ]
          }]
        };
      },
      includeReview: function () {
        return {
          include: [{
            model: sequelize.models.Review,
            as: 'review',
            required: false,
          }]
        };
      },

    },

  });

  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.associate = function (models) {
    Model.hasMany(models.CompanyDynamicPicture, {
      targetKey: 'id',
      foreignKey: 'companyDynamicId',
      onDelete: 'cascade',
      as: 'pictures',
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
    Model.belongsTo(models.Review, {
      targetKey: 'id',
      foreignKey: 'reviewId',
      onDelete: 'cascade',
      as: 'review'
    });
    Model.belongsTo(models.Post, {
      targetKey: 'id',
      foreignKey: 'postId',
      onDelete: 'cascade',
      as: 'post'
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

