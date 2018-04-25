'use strict';

// core
const debug = require('debug')('APP:COMPANY');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const positionMethod = require(__base + 'methods/positionMethod');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const jobs = require(__base + 'jobs');
const fs = require('fs');
const xlsx = require('node-xlsx');

let Route = module.exports = {};

/**
 *  @api {get} /enterprises/enterpriseId/companies Get all the enterprises information
 *  @apiName  GetCompanys
 *  @apiGroup Company
 *
 *  @apiParam  {String} enterpriseId   The enterprise unique id.
 *
 *  @apiParam  {String} name   The company name.
 *  @apiParam  {String} field   The Company field.
 *  @apiParam  {Blooean} examine    Whether to examine article,default 'false'.
 *  @apiParam  {String}  search     首页搜索框,搜索公司(必须).例如:http://localhost:3000/api/v1/enterprises/1/companies?search=YOOV
 *
 *
 *  @apiSuccess {Number} id  Company unique ID.
 *  @apiSuccess {Number} countryId   Country Id.
 *  @apiSuccess {Number} enterpriseId  Enterprises unique ID.
 *  @apiSuccess {String} name   The company name.
 *  @apiSuccess {String} scale  Company scale.
 *  @apiSuccess {Boolea} field   Company field.
 *  @apiSuccess {String} stage   Company stage.
 *  @apiSuccess {Enum}   background   Company background.
 *  @apiSuccess {Date} examine  Whether to examine article,default 'false'.
 *  @apiSuccess {Number} address  Company address.
 *  @apiSuccess {Enum}  description  Company description.
 *  @apiSuccess {Number}  createdBy  This data created people,storing the enterprise ID.
 *  @apiSuccess {Number}  updatedBy   This data updated people,storing the enterprise ID.
 *  @apiSuccess {Date}  createdAt     This  data created time.
 *  @apiSuccess {Date}  updatedAt     This  data updated time.
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "id": 1,
 *         "countryId": 1,
 *         "enterpriseId": 1,
 *         "name": "YOOV互联网科技有限公司",
 *         "scale": "规模",
 *         "field": "领域",
 *         "stage": "阶段",
 *         "background": "背景",
 *         "examine": false,
 *         "address": "地址",
 *         "description": "藐视",
 *         "createdBy": null,
 *         "updatedBy": null,
 *         "createdAt": "2016-03-28T06:50:47.260Z",
 *         "updatedAt": "2016-03-28T06:50:47.260Z"
 *      }
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */

Route.index = async function(req, res, next) {
  debug('Enter index method!');

  const rules = {
    isApproved: 'boolean',
    isVIP: 'boolean',
    search: 'min:1',
    enterpriseId: 'integer|exists:Enterprise,id',
  };

  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);
  if (!_.isUndefined(input.search) && input.search !== '') {
    filter.where = {
      name: {
        $iLike: '%' + input.search + '%'
      }
    };
  }

  if (!_.isUndefined(input.enterpriseId)) filter.where.enterpriseId = input.enterpriseId;
  if (!_.isUndefined(input.isApproved)) filter.where.isApproved = input.isApproved;
  if (!_.isUndefined(input.isVIP)) filter.where.isVIP = input.isVIP;

  // query OrderBy
  filter.order = [['isVIP', 'DESC'],['updatedAt', 'DESC']];

  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Company.getAttributes(), ['updatedAt', 'countryId', 'enterpriseId']);
  let scopes = ['includeIcon'];
  try {
    let result = await models.Company.scope(scopes).findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /enterprises/enterpriseId/companies/id Get the company information
 *  @apiName  GetCompany
 *  @apiGroup Company
 *
 *  @apiParam  {Number} id      Company unique ID.
 *  @apiParam  {Number} enterpriseId  Enterprises unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function(req, res, next) {
  debug('Enter show method!');
  const rules = {
    enterpriseId: 'integer|exists:Enterprise,id',
    isApproved: 'boolean',
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.companyId
    }
  };

  if (!_.isUndefined(input.enterpriseId)) filter.where.enterpriseId = input.enterpriseId;
  if (!_.isUndefined(input.isApproved)) filter.where.isApproved = input.isApproved;

  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Company.getAttributes(), ['updatedAt', 'countryId', 'enterpriseId']);

  try {
    let result = await models.Company.scope(['includeIcon', 'includeCountry', 'includeCompanyPictures', 'includeCover','includeCompanyInterlocutor']).findOne(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /enterprises/enterpriseId/companies Create the company information
 *  @apiName  CreateCompany
 *  @apiGroup Company
 *
 *  @apiParam  {Number} enterpriseId  The enterprise unique ID.
 *
 *  @apiDescription  Get picture url: http://localhost:3000/uploads/:uploadType/:id([0-9]+)/:key
 *  uploadType: picture , file , leave_attachment.
 *  id: Upload table unique Id.
 *  key: Upload table key field.
 *
 *  @apiSuccess  {String} name  Company name.
 *  @apiSuccess  {String} scale  Company scale.
 *  @apiSuccess  {Text} background  Company background.
 *  @apiSuccess  {String} address  Company address.
 *  @apiSuccess  {Number} countryId  Country unique ID.
 *  @apiSuccess  {String} field  Company field.
 *  @apiSuccess  {String} stage  Company stage.
 *  @apiSuccess  {Boolean} examine  Company examine, default 'false'.
 *  @apiSuccess  {String} description  Company description.
 *
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.create = async function(req, res, next) {
  debug('Enter create method!');
  const rules = {
    name: 'required|min:1',
    field: 'min:0',
    scale: 'min:1|in:myself-only,2-10,11-50,51-200,201-500,501-1000,1001-5000,5001-10000,10001+',
    stage: 'min:1|in:public-company,educational,self-employed,government-agency,non-profit,self-owned,privately-held,partnership',
    background: 'min:0',
    address: 'min:0',
    description: 'min:0',
    isApproved: 'boolean',
    countryId: 'required|exists:Country,id',
    enterpriseId: 'required|exists:Enterprise,id',
  };
  let input = _.pick(req.body, models.Company.getAttributes());
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {

    let result = await models.Company.create(input, {transaction: t});

    await t.commit();
    req.params.companyId = result.id;
    // send an email to admin, notify have as company apply.
    await jobs.create('email::companyApply', {
      company: result
    });

    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {put} /enterprises/enterpriseId/companies/id Update the company information
 *  @apiName  UpdateCompany
 *  @apiGroup Company
 *
 *  @apiParam  {Number} id      Company unique ID.
 *  @apiParam  {Number} enterpriseId  Enterprises unique ID.
 *
 *  @apiSuccess  {String} name  Company name.
 *  @apiSuccess  {String} scale  Company scale.
 *  @apiSuccess  {Text} background  Company background.
 *  @apiSuccess  {String} address  Company address.
 *  @apiSuccess  {Number} countryId  Country unique ID.
 *  @apiSuccess  {String} field  Company field.
 *  @apiSuccess  {String} stage  Company stage.
 *  @apiSuccess  {Boolean} examine  Company examine, default 'false'.
 *  @apiSuccess  {String} description  Company description.
 *
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.update = async function(req, res, next) {
  debug('Enter update method!');

  const rules = {
    name: 'min:1',
    field: 'min:0',
    scale: 'min:0',
    stage: 'min:0',
    background: 'min:0',
    address: 'min:0',
    isApproved: 'boolean',
    countryId: 'integer|exists:Country,id',
    enterpriseId: 'integer|exists:Enterprise,id',
  };
  let input = _.pick(req.body, models.Company.getAttributes());

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let company = await models.Company.findById(req.params.companyId);

    if (company === null) throw new MainError('common', 'notFound');
    if(company.isApproved && input.isApproved ) throw new MainError('company','isApproved');
    let result = await company.updateAttributes(input, {transaction: t});

    await t.commit();

    if (input.isApproved) {
      await jobs.create('email::companyApprove', {
        enterprise: {id: result.enterpriseId},
      });
    }

    req.params.companyId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    debug('ERROR: %j', err);
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /enterprises/enterpriseId/companies/id Delete the company information
 *  @apiName  DeleteCompany
 *  @apiGroup Company
 *
 *  @apiParam  {Number} id      Company unique ID.
 *  @apiParam  {Number} enterpriseId  Enterprises unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.destroy = async function(req, res, next) {
  debug('Enter destroy method!');

  let filter = await res.paginatorHelper.initFilter();
  if (req.params.enterpriseId) {
    filter.where = {
      id: req.params.companyId,
      isApproved: false,
      enterpriseId: req.params.enterpriseId,
    }
  } else {
    filter.where = {
      id: req.params.companyId
    }
  }
  let t = await models.sequelize.transaction();
  try {
    let result = await models.Company.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.destroy({
      transaction: t
    });
    await t.commit();
    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.candidateChart = async function(req, res, next) {
  debug('Enter candidateChart method!');

  try {
    let result = await positionMethod.getCandidateChartByCompanyId(req.params.companyId);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.clickTraffic = async function(req, res, next) {
  debug('ENTER click traffic method!');

  const rules = {
    companyId: 'integer|exists:Company,id,isApproved,true',
  };
  let input = _.pick(req.query, Object.keys(rules));
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Company.findById(input.companyId);
    if (result === null) throw new MainError('common', 'notFound');

    result.view = result.view + 1;

    await result.updateAttributes({view: result.view}, {transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.export = async function (req,res,next) {
  debug('Enter export method!');

  try {
    let result = await models.Company.findAll({order:[['id', 'ASC']]});

    let data = [];
    result.forEach((val)=>{
      val = val.toJSON();
      if(data.length === 0){
        data.push(Object.keys(val));
      }
      let company = Object.values(val);
      data.push(company);
    });

    let path = __base + 'backend/assets/company.xlsx';
    let buffer = xlsx.build([{name: 'company', data: data}]);
    fs.writeFileSync(path, buffer, 'binary');

    res.item('./assets/company.xlsx');
  } catch (err) {
    next(err);
  }
}
