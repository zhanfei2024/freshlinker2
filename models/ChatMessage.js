'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('ChatMessage', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    senderId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
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
  });
  
  // Class Method
  Model.getAttributes = function () {
    return Object.keys(Model.rawAttributes);
  };
  Model.associate = function (models) {
    Model.belongsTo(models.ChatInterlocutor, {
      targetKey: 'id',
      foreignKey: 'senderId',
      onDelete: 'cascade',
      as: 'sender'
    });
    Model.belongsTo(models.ChatInterlocutor, {
      targetKey: 'id',
      foreignKey: 'receiverId',
      onDelete: 'cascade',
      as: 'receiver'
    });
  };
  // Instance Method
  Model.prototype.toJSON = function () {
    return  this.dataValues;
  };
  return Model;
};

