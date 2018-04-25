'use strict';

module.exports = function (sequelize,DataTypes) {
  const Model = sequelize.define('CompanyWelfare',{
    id:{
      type:DataTypes.BIGINT,
      allowNull:false,
      autoIncrement:true,
      primaryKey:true
    },
    companyId:{
      type:DataTypes.BIGINT,
      allowNull:true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },{
    charset:'utf-8',
    timestamps:true,
    freezeTableName:true
  });

  // Class Method
  Model.getAttributes = function(){
    return Object.keys(Model.rawAttributes);
  };
  Model.associate = function(models){
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

