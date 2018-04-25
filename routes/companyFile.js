'use strict';

// core
const debug = require('debug')('APP:COMPANY_FILE');

// model
const models = require(__base + 'models');

// library
const indicative = require('indicative');
const _ = require('lodash');
const randomString = require('randomstring');
const path = require('path');
const s3 = require('knox').createClient(require(__base + 'config/filesystem'));

let Route = module.exports = {};

Route.index = async function(req,res,next){
  debug('Enter index method!');
  const rules = {
    companyId:'integer|exists:Company,id'
  };

  let input = _.pick(req.query,Object.keys(rules));
  try{
    await indicative.validate(input,rules,res.validatorMessage);
  }catch(err){
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);
  if(!_.isUndefined(input.companyId)) filter.where.companyId = input.companyId;

  try{
    let result = await models.CompanyFile.findAndCountAll(filter);

    return res.paginatorWithCount(result,{},filter);
  }catch(err){
    return next(err);
  }

};

Route.show = async function(req,res,next){
  debug('Enter show method!');

  const rules = {
    companyId:'integer|exists:Company,id'
  };

  let input = _.pick(req.query,Object.keys(rules));
  try{
    await indicative.validate(input,rules,res.validatorMessage);
  }catch(err){
    return res.validateError2(err);
  }

  let filter = {
    where:{
      id: req.params.fileId
    }
  };
  if(!_.isUndefined(input.companyId)) filter.where.companyId = input.companyId;

  try{
    let result = await models.CompanyFile.findOne(filter);
    if(result === null) throw new MainError('common','notFound');
    return res.item(result);
  }catch(err){
    return next(err);
  }

};

Route.create = async function(req,res,next){
  debug('Enter create method!');

  const rules = {
    companyId:'integer|exists:Company,id',
    url:'string'
  };

  let input = _.pick(req.body,Object.keys(rules));
  try{
    await indicative.validate(input,rules,res.validatorMessage);
  }catch(err){
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try{
    let company = await models.Company.findById(input.companyId);
    if(company === null) throw new MainError('common','notFound');
    if (!company.isVIP) throw new MainError('company', 'isVIP');

    let companyFile = await models.CompanyFile.findOne({where:{companyId:company.id}});
    if(companyFile !== null) await companyFile.destroy({transaction: t});

    let result = await models.CompanyFile.create(input,{transaction:t});
    await t.commit();

    req.params.fileId = result.id;

    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

Route.destroy = async function(req,res,next){
  debug('Enter destroy method!');

  const rules = {
    companyId:'integer|exists:Company,id'
  };

  let input = _.pick(req.query,Object.keys(rules));
  try{
    await indicative.validate(input,rules,res.validatorMessage);
  }catch(err){
    return res.validateError2(err);
  }

  let filter = {
    where:{
      id: req.params.fileId
    }
  };
  if(!_.isUndefined(input.companyId)) filter.where.companyId = input.companyId;

  let t = await models.sequelize.transaction();
  try{
    let result = await models.CompanyFile.findOne(filter);
    if(result === null) throw new MainError('common','notFound');
    await result.destroy({transaction:t});
    await t.commit();
    return res.return();
  }catch(err){
    await t.rollback();
    return next(err);
  }

};

Route.uploadFiles = async function(req,res,next){
  debug('Enter upload video method!');
  const rules = {
    file: 'array',
    'file.*': 'file|size:50000'
  };
  let input = _.pick(req.files,Object.keys(rules));
  try{
    await indicative.validate(input,rules,res.validatorMessage);
  }catch(err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try{
    let company = await models.Company.findById(req.params.companyId);
    if(company === null) throw new MainError('common','notFound');
    if (!company.isVIP) throw new MainError('company', 'isVIP');

    let companyFile = await models.CompanyFile.findOne({where:{companyId:company.id}});
    if(companyFile !== null) await companyFile.destroy({transaction: t});

    let fileKey = randomString.generate(24);
    let extname = path.extname(input.file[0].originalname).toLowerCase();
    let filename = path.basename(input.file[0].originalname,extname);
    // 文件存放位置
    let cloudPath = `company/${company.id}/files/${fileKey}/original${extname}`;

    await s3.upload(input.file[0].path,cloudPath);

    // Insert into company file table.
    let companyFileAttributes = {};
    companyFileAttributes.companyId = req.params.companyId;
    companyFileAttributes.name = !_.isUndefined(req.body.name) ? req.body.name : filename;
    companyFileAttributes.mime = input.file[0].mimetype;
    companyFileAttributes.size = input.file[0].size;
    companyFileAttributes.key = fileKey;
    companyFileAttributes.extension = extname.substring(1);

    let result = await models.CompanyFile.create(companyFileAttributes, {transaction: t});
    await t.commit();

    req.params.fileId = result.id;

    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};
