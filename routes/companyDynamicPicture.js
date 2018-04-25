'use strict';

// core
const debug = require('debug')('APP:COMPANY_DYNAMIC_PICTURE');

// models
const models = require(__base + 'models');

// library
const _ = require('lodash');
const path = require('path');
const randomstring = require('randomstring');

const s3 = require(__base + 'modules/s3');
const indicative = require('indicative');

let Route = module.exports = {};

Route.index = async function(req,res,next){
  debug('Enter index method!');

  let filter = await res.paginatorHelper.initFilter(req.query);
  filter.where.companyDynamicId = req.params.companyDynamicId;

  try{
    let result = await models.CompanyDynamicPicture.findAndCountAll(filter);
    return res.paginatorWithCount(result,{},filter);
  } catch(err){
    return next(err);
  }
};

Route.show = async function(req,res,next){
  debug('Enter show method!');

  let filter = {
    where:{
      id: req.params.pictureId,
      companyDynamicId:req.params.companyDynamicId,
    }
  };

  try{
    let result = await models.CompanyDynamicPicture.findOne(filter);
    return res.item(result);
  }catch (err){
    return next(err);
  }
};

Route.destroy = async function (req,res,next) {
  debug('Enter destroy method!');

  let t = await models.sequelize.transaction();
  try {
    let result = await models.CompanyDynamicPicture.findOne({
      where:{
        id:req.params.pictureId,
        companyDynamicId:req.params.companyDynamicId,
      },
      transaction:t
    });

    if(result === null) throw new MainError('common','notFound');
    await result.destroy({transaction:t});
    await t.commit();
    return res.return();
  }catch (err){
    await t.rollback();
    return next(err);
  }
};

Route.uploadPicture = async function (req,res,next) {
  debug('Enter upload picture method!');

  const rules = {
    file:'array',
    'file.*':'required|image',
  };

  let input = _.pick(req.files,Object.keys(rules));
  try{
    await indicative.validate(input,rules,res.validatorMessage);
  }catch(err){
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try{
    let companyDynamic = await models.CompanyDynamic.findOne({where:{id:req.params.companyDynamicId},transaction:t});
    if(companyDynamic === null) throw new MainError('common','notFound');

    let fileKey = randomstring.generate(24);
    let extname = path.extname(input.file[0].originalname).toLowerCase();
    let filename = path.basename(input.file[0].originalname,extname);

    // 文件存放在服務器位置
    let cloudPath = `companyDynamic/${companyDynamic.id}/picture/${fileKey}/original${extname}`;

    await s3.upload(input.file[0].path,cloudPath);

    let reviewImageAttributes = {};
    reviewImageAttributes.companyDynamicId = companyDynamic.id;
    reviewImageAttributes.name = !_.isUndefined(req.body.name) ? req.body.name : filename;
    reviewImageAttributes.mime = input.file[0].mimetype;
    reviewImageAttributes.size = input.file[0].size;
    reviewImageAttributes.key = fileKey;
    reviewImageAttributes.extension = extname.substring(1);
    let result = await models.CompanyDynamicPicture.create(reviewImageAttributes,{transaction:t});
    await t.commit();

    req.params.pictureId = result.id;
    return Route.show(req,res,next);
  } catch (err){
    await t.rollback();
    return next(err);
  }

};
