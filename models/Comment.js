'use strict';

const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('Comment', {
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
    objectType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    objectId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    postId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    totalLike: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    toUserId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    totalReply: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
      includeUser: function () {
        return {
          include: [
            {
              attributes: ['id', 'lastName', 'firstName','selfDescription'],
              model: sequelize.models.User, as: 'user',
              include: [
                {
                  model: sequelize.models.Company, as: 'companies',
                  through: {
                    model: sequelize.models.UserCompany, as: 'UserCompanies',
                    where: {
                      status: 'pass',
                      }
                    },
                  required: false,
                },
                {
                  model: sequelize.models.UserPicture, as: 'icon',
                  required: false,
                  where: {
                    isIcon: true,
                  },
                },
              ],
            }
          ]
        };
      },
      includeToUser: function () {
        return {
          include: [
            {
              attributes: ['id', 'lastName', 'firstName','selfDescription'],
              model: sequelize.models.User, as: 'toUser',
              required: false,
              include: [
                {
                  model: sequelize.models.Company, as: 'companies',
                  through: {
                    model: sequelize.models.UserCompany, as: 'UserCompanies',
                    where: {
                      status: 'pass',
                    }
                  },
                  required: false,
                },
                {
                  model: sequelize.models.UserPicture, as: 'icon',
                  required: false,
                  where: {
                    isIcon: true,
                  },
                },
              ],
            }
          ]
        };
      },
      includeComment: function () {
        return {
          include: [
            {
              model: sequelize.models.Comment, as: 'replies',
              required: false,
              where: {
                objectType: 'Comment',
              },
              include: [
                {
                  attributes: ['id', 'lastName', 'firstName'],
                  model: sequelize.models.User, as: 'user',
                  include: [
                    {
                      model: sequelize.models.UserPicture, as: 'icon',
                      required: false,
                      where: {
                        isIcon: true,
                      },
                    }
                  ]
                }
              ]
            }
          ]
        };
      },
      includePost: function () {
        return {
          include: [
            {
              model: sequelize.models.Post, as: 'post',
              where:{active:true},
              attributes:['title','view','totalComment','updatedAt'],
              required: false,
            }
          ]
        };
      },
      includeCommentLike: function () {
        return {
          include: [
            {
              attributes: ['userId'],
              model: sequelize.models.CommentLike, as: 'CommentLikes',
              required: false,
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
  Model.getReadAttributesByRole = function (roleName) {
    let attributes = this.getAttributes();
    switch (roleName) {
      case 'user':
        return attributes;
      case 'enterprise':
        return attributes;
      case 'public':
        return attributes;
      case 'admin':
        return attributes;
    }
  };
  Model.getEditAttributesByRole = function (roleName) {
    let attributes = this.getAttributes();
    switch (roleName) {
      case 'user':
        return _.without(attributes, 'userId', 'commentId', 'toUserId', 'totalLike', 'objectType', 'objectId');
      case 'enterprise':
        return _.without(attributes, 'userId', 'commentId', 'toUserId', 'totalLike', 'objectType', 'objectId');
      case 'public':
        return ['totalLike'];
      case 'admin':
        return attributes;
    }
  };
  Model.associate = function (models) {
    Model.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: 'userId',
      onDelete: 'cascade',
      as: 'user'
    });

    Model.belongsTo(models.User, {
      targetKey: 'id',
      foreignKey: 'toUserId',
      onDelete: 'cascade',
      as: 'toUser'
    });


    Model.belongsTo(models.Post, {
      targetKey: 'id',
      foreignKey: 'postId',
      onDelete: 'cascade',
      as: 'post'
    });

    Model.belongsToMany(models.User, {
      foreignKey: 'commentId',
      otherKey: 'userId',
      through: {model: models.CommentLike, as: 'CommentLike'},
      as: 'likes'
    });

    Model.hasMany(models.Comment, {
      constraints: false,
      targetKey: 'id',
      foreignKey: 'objectId',
      as: 'replies',
    });

    Model.hasMany(models.CommentLike, {
      constraints: false,
      targetKey: 'id',
      foreignKey: 'commentId',
      as: 'CommentLikes',
    });
  };

  // Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };

  return Model;
};

