'use strict';

// core
const debug = require('debug')('APP:FILE');
const logger = require(__base + 'modules/logger');

// library
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const indicative = require('indicative');


let Route = module.exports = {};

Route.uploadFile = async function(req, res, next) {
  debug('Enter upload file method!');
  
  const rules = {
    file: 'array',
    'file.*': 'required|image',
  };
  
  let input = _.pick(req.files, Object.keys(rules));
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let filename = path.basename(input.file[0].originalname);
    
    // 源文件位置
    let sourcePath = input.file[0].path;
    // 文件存放在服务器的位置.
    let uploadPath =__base + `public/images/${filename}`;

    await new Promise((resolve,reject) =>{

      let fileReadStream=fs.createReadStream(sourcePath);
      let fileWriteStream = fs.createWriteStream(uploadPath);

      fileReadStream.pipe(fileWriteStream);
      
      fileReadStream.on('error', (err) => {
        reject(err);
      });

      fileWriteStream.on('error', (err) => {
        reject(err);
      });

      fileWriteStream.on('close',function(){
        logger.log('info',`downloaded file to local path: ${uploadPath}`);
        resolve(uploadPath);
      });

    });
    
    return res.item(filename);
    
  } catch (err) {
    return next(err);
  }
};

Route.deleteFile = async function(req, res, next) {
  debug('Enter upload file method!');
  
  const rules = {
    name: 'string',
  };
  let input = _.pick(req.params, Object.keys(rules));
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }
  
  let path =__base + `public/images/${input.name}`;
  try {
    let result = await new Promise((resolve, reject)=> {
      if (input.path === '') {
        resolve(true);
      }
      let prefix = path + '';
      logger.log('info', `starting delete path: ${prefix}`);
      try {
        fs.unlinkSync(path);
        resolve(true);
      }catch(err){
        reject(err);
      }

    });
    logger.log('info', `delete file status: ${result}`);
  
    return res.item(result);
    
  } catch (err) {
    return next(err);
  }
};

