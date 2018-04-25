'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('EducationLevel', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    charset: 'utf8',
    timestamps: true,
    freezeTableName: true,
    getterMethods: {},
    setterMethods: {},
  });

  // Class Method
  Model.getEditableKeys = function (){
    return ['name', 'description'];
  };
  Model.initSeed = function (){
    let data = [
      {id:1,name: 'Master', order: 21},
      {id:2,name: 'Post Graduate', order: 20},
      {id:3,name: 'Degree', order: 19},
      {id:4,name: 'College', order: 18},
      {id:5,name: 'School Certificate', order: 17},
      {id:6,name: 'Any', order: 16}
    ];
    return Model.bulkCreate(data, {returning: true});
  };

// Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };
  return Model;
};

