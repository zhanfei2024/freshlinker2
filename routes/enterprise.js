'use strict';

// core
const debug = require('debug')('APP:ENTERPRISE');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const moment = require('moment');
const fs = require('fs');
const xlsx = require('node-xlsx');

let Route = module.exports = {};

Route.index = async function(req, res, next) {
  const rules = {
    search: 'min:1',
    email: 'min:1',
    active: 'min:1',
  };
  let input = _.pick(req.query, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = await res.paginatorHelper.initFilter(req.query);
  if (!_.isUndefined(input.search) && input.search !== '') {
    filter.where.$or = {
      lastName: {
        $iLike: '%' + input.search + '%'
      },
      firstName: {
        $iLike: '%' + input.search + '%'
      }
    };
  }

  if (!_.isUndefined(input.email)) filter.where.email = {$iLike: '%' + input.email + '%'};
  if (!_.isUndefined(input.active)) filter.where.active = input.active;

  filter.order = [['updatedAt', 'DESC']];
  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Enterprise.getAttributes(), ['updatedAt', 'id']);
  try {
    let result = await models.Enterprise.findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /enterprises/id(self) Get of the enterprise information
 *  @apiName  Get Enterprise
 *  @apiGroup Enterprise
 *
 *  @apiParam  {Number} id(self) Enterprises unique ID.
 *
 *  @apiError id The <code>id</code> of the Enterprise was not found.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function(req, res, next) {
  debug(`ENTER show method!`);

  let filter = {
    where: {
      id: req.params.enterpriseId
    }
  };
  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Enterprise.getAttributes(), ['updatedAt', 'countryId', 'enterpriseId']);

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Enterprise.scope(['includePlan']).findOne(filter);
    if(moment(result.positionExpiredDate).diff(moment(), 'd') < 0){
      await result.updateAttributes({positionQuota:0},{transaction:t})
    }
      
    let companies = await models.Company.findAll({where:{enterpriseId:result.id}});

    let promises = [];
    if(moment(result.planExpiredDate).diff(moment(), 'd') > 0){
      _.forEach(companies, function (company) {
        promises.push(company.updateAttributes({isVIP:true},{transaction:t}));
      });
    }else{
      _.forEach(companies, function (company) {
        promises.push(company.updateAttributes({isVIP:false},{transaction:t}));
      });
    }
    await Promise.all(promises);

    await t.commit();
    return res.item(result);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {post} /enterprises Create of the enterprise information
 *  @apiName  Create Enterprise
 *  @apiGroup Enterprise
 *
 *  @apiParam {String} lastName  Enterprise last name.
 *  @apiParam {String} firstName  Enterprise first name.
 *  @apiParam {String} enterprisename   Enterprise name.
 *  @apiParam {String}  mobilePhone  Enterprise mobile phone.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.create = async function(req, res, next) {
  debug(`ENTER create method!`);

  const rules = {
    email: 'email|min:6',
    lastName: 'min:1',
    firstName: 'min:1',
    balance: 'integer|min:1',
    positionQuota: 'integer|min:1',
    planExpiredDate: 'date',
  };

  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Enterprise.create(input, {transaction: t});

    await t.commit();

    req.params.enterpriseId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

/**
 *  @api {put} /enterprises/id(self) Update of the enterprise information
 *  @apiName  Update Enterprise
 *  @apiGroup Enterprise
 *
 *  @apiParam  {Number} id(self) Enterprises unique ID.
 *
 *  @apiSuccess {String} lastName  Enterprise last name.
 *  @apiSuccess {String} firstName  Enterprise first name.
 *  @apiSuccess {String} enterprisename   Enterprise name.
 *  @apiSuccess {String}  mobilePhone  Enterprise mobile phone.
 *
 *  @apiError id The <code>id</code> of the Enterprise was not found.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.update = async function(req, res, next) {
  debug(`ENTER update method!`);

  const rules = {
    email: 'email|min:6',
    lastName: 'min:1',
    firstName: 'min:1',
    active: 'boolean',
    balance: 'integer|min:1',
    positionQuota: 'integer|min:1',
    planExpiredDate: 'date',
  };
  let input = validateHelper.pick(req.body, rules);

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.enterpriseId
    }
  };

  let t = await models.sequelize.transaction();

  try {
    let result = await models.Enterprise.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');
    await result.updateAttributes(input, {transaction: t});

    await t.commit();

    req.params.enterpriseId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /enterprises/id Delete of the enterprise information
 *  @apiName  Delete Enterprise
 *  @apiGroup Enterprise
 *
 *  @apiParam  {Number} id Enterprises unique ID.
 *
 *  @apiError id The <code>id</code> of the Enterprise was not found.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */

Route.destroy = async function(req, res, next) {
  debug(`ENTER destroy method!`);

  let t = await models.sequelize.transaction();
  try {

    let filter = {
      where: {
        id: req.params.enterpriseId
      },
      transaction: t
    };

    let enterpriseResult = await models.Enterprise.findOne(filter);
    if (enterpriseResult === null) throw new MainError('common', 'notFound');

    await enterpriseResult.destroy({transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

Route.buyPlan = async function(req, res, next) {
  debug('Enter buy plan method.');

  const rules = {
    planId: 'integer|exists:Plan,id,active,true',
    quantity: 'min:1',
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let plan = await models.Plan.findOne({
      where: {
        id: input.planId,
        active: true,
      },
      transaction: t
    });
    if (plan === null) throw new MainError('common', 'notFound');
    if (_.isEmpty(plan.meta)) throw new MainError('plan', 'chooseEffectivePlan');

    let enterprise = await models.Enterprise.findById(req.params.enterpriseId);
    if (enterprise === null) throw new MainError('common', 'notFound');

    if (plan.meta.allowRepeatBuy === false && moment(enterprise.planExpiredDate).diff(moment(), 'd') > 0) throw new MainError('plan', 'disallowRepeatBuy');

    input.quantity = !_.isUndefined(input.quantity) ? input.quantity : 1;
    let newBalance = parseInt(enterprise.balance) - (parseInt(plan.meta.price) * input.quantity);
    if (newBalance < 0) throw new MainError('user', 'notEnoughBalance');

    let attributes = {
      balance: newBalance,
      planId: plan.id,
    };

    attributes.planExpiredDate = enterprise.planExpiredDate === null ? moment() : moment(enterprise.planExpiredDate);
    let expiredDate = moment().add((parseInt(plan.meta.planEffectiveDay) * input.quantity), 'days').format('YYYY-MM-DD');
    if (moment(expiredDate).diff(moment(attributes.planExpiredDate), 'd') > 0) attributes.planExpiredDate = expiredDate;

    await enterprise.updateAttributes(attributes, {transaction: t});

    // 插入账单
    let billAttributes = {};
    billAttributes.amount = input.quantity;
    billAttributes.enterpriseId = enterprise.id;
    billAttributes.description = `Enterprise purchase "${plan.displayName}" plan.`;
    billAttributes.currency = parseInt(plan.meta.price) * input.quantity;
    billAttributes.type = 'liberties';
    billAttributes.billedAt = moment().format();
    await models.Bills.create(billAttributes, {transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.buyPositionQuota = async function(req, res, next) {
  debug('Enter buy positionQuota method.');

  const rules = {
    planId: 'integer',
    quantity: 'min:1',
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {

    let setting = await models.Setting.findById(2,{transaction: t});
    let plan = setting.global.length > input.planId ? setting.global[input.planId] : null;

    if (plan === null || plan.active === false) throw new MainError('common', 'notFound');
    if (_.isEmpty(plan.meta)) throw new MainError('plan', 'chooseEffectivePlan');

    let enterprise = await models.Enterprise.findById(req.params.enterpriseId);
    if (enterprise === null) throw new MainError('common', 'notFound');
    if (moment(enterprise.positionExpiredDate).diff(moment()) <= 0) enterprise.positionQuota = 0;

    if (plan.meta.allowRepeatBuy === false && moment(enterprise.positionExpiredDate).diff(moment(), 'd') > 0) throw new MainError('plan', 'disallowRepeatBuy');
    if (plan.meta.allowRepeatBuy === false && enterprise.positionQuota !== null) throw new MainError('plan', 'disallowRepeatBuy');

    input.quantity = !_.isUndefined(input.quantity) ? input.quantity : 1;
    let newBalance = parseInt(enterprise.balance) - (parseInt(plan.meta.price) * input.quantity);
    if (newBalance < 0) throw new MainError('user', 'notEnoughBalance');

    let attributes = {
      balance: newBalance,
      positionQuota: enterprise.positionQuota + (parseInt(plan.meta.positionQuota) * input.quantity),
    };

    attributes.positionExpiredDate = enterprise.positionExpiredDate === null ? moment() : moment(enterprise.positionExpiredDate);
    let expiredDate = moment().add((parseInt(plan.meta.positionEffectiveDay) * input.quantity), 'days').format('YYYY-MM-DD');
    if (moment(expiredDate).diff(moment(attributes.positionExpiredDate), 'd') > 0) attributes.positionExpiredDate = expiredDate;

    await enterprise.updateAttributes(attributes, {transaction: t});

    // 插入账单
    let billAttributes = {};
    billAttributes.amount = input.quantity;
    billAttributes.enterpriseId = enterprise.id;
    billAttributes.description = `Enterprise purchase "${plan.displayName}" plan.`;
    billAttributes.currency = parseInt(plan.meta.price) * input.quantity;
    billAttributes.type = 'liberties';
    billAttributes.billedAt = moment().format();
    await models.Bills.create(billAttributes, {transaction: t});
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
    let result = await models.Enterprise.findAll({order:[['id', 'ASC']]});
  
    let data = [];
    result.forEach((val)=>{
      delete val.paymentAccountId;
      val = val.toJSON();
      if(data.length === 0){
        data.push(Object.keys(val));        
      }
      
      data.push(Object.values(val));
    });
  
    let path = __base + 'backend/assets/enterprise.xlsx';
    let buffer = xlsx.build([{name: 'enterprise', data: data}]);
    fs.writeFileSync(path, buffer, 'binary');
    
    res.item('./assets/enterprise.xlsx');
  } catch (err) {
    next(err);
  }
}