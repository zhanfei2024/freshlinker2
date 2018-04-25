'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE_COMPANY_FILE');

// library
const _ = require('lodash');

// models
const models = require(__base + 'models');
const companyFileRoute = require(__base + 'routes/companyFile');

let Route = module.exports = {};

Route.index = async function(req,res,next){
  debug('Enter index method!');

  try{
    let index = _.indexOf(res.locals.companyIds,parseInt(req.params.companyId));
    if(index !== -1){
      req.query.companyId = res.locals.companyIds[index];
    }else{
      throw new MainError('common','notFound');
    }
    return companyFileRoute.index(req,res,next);
  }catch (err){
    return next(err);
  }
};

Route.show = async function(req,res,next){
  debug('Enter show method!');
  try{
    let index = _.indexOf(res.locals.companyIds,parseInt(req.params.companyId));
    if(index !== -1){
      req.query.companyId = res.locals.companyIds[index];
    }else{
      throw new MainError('common','notFound');
    }
    return companyFileRoute.show(req,res,next);
  }catch (err){
    return next(err);
  }
};

Route.create = async function(req,res,next){
  debug('Enter create method!');
  try{
    let index = _.indexOf(res.locals.companyIds,parseInt(req.params.companyId));
    if(index !== -1){
      req.body.companyId = res.locals.companyIds[index];
    }else{
      throw new MainError('common','notFound');
    }
    return companyFileRoute.create(req,res,next);
  }catch (err){
    return next(err);
  }
};

Route.destroy = async function(req,res,next){
  debug('Enter delete method!');
  try{
    let index = _.indexOf(res.locals.companyIds,parseInt(req.params.companyId));
    if(index !== -1){
      req.query.companyId = res.locals.companyIds[index];
    }else{
      throw new MainError('common','notFound');
    }
    return companyFileRoute.destory(req,res,next);
  }catch (err){
    return next(err);
  }
};

Route.uploadFiles = async function(req, res, next) {
  debug('Enter upload file method!');
  try {
    let index = _.indexOf(res.locals.companyIds, parseInt(req.params.companyId));
    if (index !== -1) {
      req.params.companyId = res.locals.companyIds[index];
    } else {
      throw new MainError('common', 'notFound');
    }
    return companyFileRoute.uploadFiles(req, res, next);
  } catch (err) {
    return next(err);
  }
};
