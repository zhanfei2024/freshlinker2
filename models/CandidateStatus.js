'use strict';

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('CandidateStatus', {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
    }, {
      charset: 'utf8',
      timestamps: true,
      freezeTableName: true,
      getterMethods: {},
      setterMethods: {},
    }
  );

  // Class Method
  Model.getEditableKeys = function (){
    return ['code', 'name'];
  };
  Model.initSeed = function (){
    let data = [
      {id: 1, code: 'unprocessed', name: 'unprocessed'},
      {id: 2, code: 'shortlist', name: 'shortlist'},
      {id: 3, code: 'not-suitable', name: 'not-suitable'},
      {id: 4, code: 'complete', name: 'complete'},
      {id: 5, code: 'success', name: 'success'},
    ];

    return Model.bulkCreate(data, {returning: true});
  };

// Instance Method
  Model.prototype.toJSON = function () {
    return this.dataValues;
  };

  return Model;
};
