'use strict';

// core
const debug = require('debug')('APP:POSITION');

// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const moment = require('moment');
const positionMethod = require(__base + 'methods/positionMethod');
const tag = require(__base + 'methods/tag');
const fs = require('fs');
const xlsx = require('node-xlsx');

let Route = module.exports = {};

/**
 *  @api {get} /companys/companyId/positions Get all the positions information
 *  @apiName  GetPositions
 *  @apiGroup Position
 *
 *  @apiParam  {String} name  Position name.
 *  @apiParam  {String} type  Position type.
 *  @apiParam  {String} experience  Education experience.
 *  @apiParam  {String}  search     首页搜索框,搜索职位(必须).例如:http://localhost:3000/api/v1/users/1/positions?search=CEO
 *  @apiParam  {Array}  categoryIds 首页搜索框,搜索职位分类(必须).例如:http://localhost:3000/api/v1/users/1/positions?search=CEO&categoryIds=1,categoryIds=2,categoryIds=3
 *
 *
 *  @apiSuccess {Number} id  Position unique ID.
 *  @apiSuccess {Number} companyId   Company unique ID.
 *  @apiSuccess {String} name  Position name.
 *  @apiSuccess {String} classIfication   The position class ification.
 *  @apiSuccess {String} type  Position type.
 *  @apiSuccess {Number} minSalary   Position minSalary.
 *  @apiSuccess {Number} maxSalary   Position maxSalary.
 *  @apiSuccess {Number} educationId   Education unique Id
 *  @apiSuccess {String} experience  Education experience.
 *  @apiSuccess {String} temptation  Education temptation.
 *  @apiSuccess {String}  address  Education address.
 *  @apiSuccess {text}  description  Education description.
 *  @apiSuccess {Number}  createdBy  This data created people,storing the user ID.
 *  @apiSuccess {Number}  updatedBy   This data updated people,storing the user ID.
 *  @apiSuccess {Date}  createdAt     This  data created time.
 *  @apiSuccess {Date}  updatedAt     This  data updated time.
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "id": 1,
 *           "companyId": 1,
 *           "name": "CEO",
 *           "classIfication": "部门",
 *           "type": "全职",
 *           "minSalary": 9,
 *           "maxSalary": 10,
 *           "educationId": 1,
 *           "experience": "工作经验2-3年",
 *           "temptation": "一句话概括职位诱惑",
 *           "address": "工作地址",
 *           "description": "描述",
 *           "createdBy": null,
 *           "updatedBy": null,
 *           "createdAt": "2016-03-28T09:16:42.953Z",
 *           "updatedAt": "2016-03-28T09:16:42.953Z",
 *           "categories": [
 *             {
 *               "id": 1,
 *               "parentId": 0,
 *               "name": "父级",
 *               "depth": 0,
 *              "description": "父级",
 *               "createdBy": null,
 *               "updatedBy": null,
 *               "createdAt": "2016-03-28T09:16:35.562Z",
 *               "updatedAt": "2016-03-28T09:16:35.562Z",
 *               "positionCategoryMap": {
 *               "createdAt": "2016-03-28T09:16:42.976Z",
 *               "updatedAt": "2016-03-28T09:16:42.976Z",
 *               "positionCategoryId": 1,
 *               "positionId": 1
 *       }
 *      }
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.index = async function (req, res, next) {
  debug('Enter index method!');

  const rules = {
    active: 'boolean',
    categoryIds: 'array',
    'categoryIds.*': 'integer',
    companyId: 'integer',
    educationLevelIds: 'array',
    'educationLevelIds.*': 'integer',
    experience: 'in:0,0.5,1,2,3,4,5,5+',
    jobNatureId: 'min:1|integer',
    locationIds: 'array',
    'locationIds.*': 'min:1|integer',
    minSalary: 'integer',
    maxSalary: 'integer',
    minExpiredDate: 'date',
    maxExpiredDate: 'date',
    salaryType: 'in:hourly,monthly,yearly',
    search: 'min:1',
    tags: 'min:1',
    type: 'in:full-time,part-time,internship,freelance,others',
  };
  let input = validateHelper.pick(req.query, rules, ['locationIds.*', 'categoryIds.*', 'educationLevelIds.*']);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }
  let scopes = ['includeIndexCompanyWithSearch'];
  let filter = {where: {}};

  if (!_.isUndefined(input.search)) {
    filter.where.$or = {
      name: {
        $iLike: '%' + input.search + '%'
      },
      description: {
        $iLike: '%' + input.search + '%'
      },
      temptation: {
        $iLike: '%' + input.search + '%'
      },
      address: {
        $iLike: '%' + input.search + '%'
      }
    };
  }

  if (!_.isUndefined(input.tags)) {
    let key = input.tags.split(',');
    let orCondition = [];
    _.each(key, function (str) {
      orCondition.push({
        name: {
          $iLike: `%${str}%`
        }
      })
    });
    let tagResult = await models.Tag.findAll({
      attributes: ['id'],
      where: {
        $or: orCondition
      }
    });
    scopes.push({method: ['includePositionTagsWithSearch', tagResult]});
  }

  if (!_.isUndefined(input.categoryIds)) {
    let categories = await models.PositionCategory.findAllByIdAndFilterHasChildren(input.categoryIds);
    scopes.push({method: ['includeCategoriesWithSearch', categories]});
  }

  if (!_.isUndefined(input.locationIds)) {
    let locationIds = await models.Location.findAllByIdAndFilterHasChildren(input.locationIds);
    filter.where.locationId = {$in: locationIds};
  }

  if (!_.isUndefined(input.active)) filter.where.active = input.active;
  if (!_.isUndefined(input.minExpiredDate)) filter.where.expiredDate = {$gte: input.minExpiredDate};
  if (!_.isUndefined(input.maxExpiredDate)) filter.where.expiredDate = {$lte: input.maxExpiredDate};
  if (!_.isUndefined(input.companyId)) filter.where.companyId = input.companyId;

  if (!_.isUndefined(input.type)) filter.where.type = input.type;
  if (!_.isUndefined(input.salaryType)) filter.where.salaryType = input.salaryType;
  if (!_.isUndefined(input.minSalary)) filter.where.minSalary = {$gte: input.minSalary};
  if (!_.isUndefined(input.maxSalary)) filter.where.maxSalary = {$lte: input.maxSalary};

  if (!_.isUndefined(input.experience)) filter.where.experience = input.experience;
  if (!_.isUndefined(input.jobNatureId)) filter.where.jobNatureId = input.jobNatureId;
  if (!_.isUndefined(input.educationLevelIds)) filter.where.educationLevelId = {$in: input.educationLevelIds};

  // attribute handle
  filter.attributes = ['id'];

  try {
    let positions = await models.Position.scope(scopes).findAll(filter);

    let orderFilter = await res.paginatorHelper.initFilter(req.query);
    orderFilter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Position.getReadAttributesByRole('index'));

    orderFilter.where = {
      id: {$in: _.map(positions, 'id')}
    };
    orderFilter.order = [[{model: models.Company,as: 'company'}, 'isVIP', 'DESC'], ['createdAt', 'DESC'], ["view", 'DESC']];

    let result = await models.Position.scope(['includeEducation', 'includeLocation', 'includeIndexCompany', 'includeCategories', 'includeJobNature', 'includePositionSkills']).findAndCountAll(orderFilter);

    result.count = positions.length;
    return res.paginatorWithCount(result, {}, orderFilter);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /company/companyId/positions/id Get the position information
 *  @apiName  GetPosition
 *  @apiGroup Position
 *
 *  @apiParam {Number} id   Positions unique ID.
 *  @apiParam {Number} companyId   Company unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.show = async function (req, res, next) {
  debug('Enter show method!');
  const rules = {
    active: 'boolean',
    minExpiredDate: 'date',
  };
  let input = validateHelper.pick(req.query, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.positionId,
    }
  };

  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Position.getAttributes(), ['updatedAt', 'companyId', 'educationLevelId']);
  try {
    if (!_.isUndefined(input.minExpiredDate)) filter.where.expiredDate = {$gte: input.minExpiredDate};
    if (!_.isUndefined(input.active)) filter.where.active = input.active;
    let scopes = ['includePositionTags', 'includeJobNature', 'includePositionSkills', 'includeCompany', 'includeLocation', 'includeCategories', 'includeEducation', 'includeCandidates', 'includePositionQuestion'];
    let result = await models.Position.scope(scopes).findOne(filter);
    return res.item(result);
  } catch (err) {
    return next(err);
  }

};

/**
 *  @api {post} /company/companyId/positions Create the position information
 *  @apiName  CreatePosition
 *  @apiGroup Position
 *
 *  @apiParam {Number} companyId   The company unique ID.
 *
 *  @apiSuccess {String} name  Position name.
 *  @apiSuccess {String} type  Position type.
 *  @apiSuccess {Number} minSalary   Position minSalary.
 *  @apiSuccess {Number} maxSalary   Position maxSalary.
 *  @apiSuccess {Number} educationId   Education unique Id
 *  @apiSuccess {String} experience  Education experience.
 *  @apiSuccess {String} temptation  Education temptation.
 *  @apiSuccess {String}  address  Education address.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.create = async function (req, res, next) {
  debug('Enter create method!');
  const rules = {
    name: 'required|min:1',
    type: 'in:full-time,part-time,internship,freelance,others',
    minSalary: 'integer',
    maxSalary: 'integer',
    experience: 'in:0,0.5,1,2,3,4,5,5+',
    educationLevelId: 'required|integer|exists:EducationLevel,id',
    postedDate: 'date',
    expiredDate: 'date',
    companyId: 'required|integer|exists:Company,id',
    categoryIds: 'required|array',
    'categoryIds.*': 'integer',
    active: 'boolean',
    email: 'required|min:1|string',
    temptation: 'min:0',
    address: 'min:0',
    salaryType: 'min:1|in:monthly,hourly,yearly',
    description: 'min:0',
    locationId: 'min:1|integer|exists:Location,id',
    jobNatureId: 'min:1|integer|exists:JobNature,id',
    skills: 'array',
    'skills.*.name': 'requiredIf:skills|min:1'
  };
  let input = validateHelper.pick(req.body, rules, ['categoryIds.*', 'skills.*']);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let company = await models.Company.findOne({where: {id: input.companyId}, transaction: t});

    input.postedDate = _.isUndefined(input.postedDate) ? moment().format('YYYY-MM-DD') : input.postedDate;

    // check location
    if (!_.isUndefined(input.locationId)) {
      let locations = await models.Location.findAllByIdAndFilterHasNotChildren(input.locationId);
      if (locations.length !== 1) throw new MainError('position', 'LocationNotExists');
    }

    let result = await models.Position.create(input, {transaction: t});

    if (!_.isUndefined(input.categoryIds)) {
      let categories = await models.PositionCategory.findAllByIdAndFilterHasNotChildren(input.categoryIds);
      if (categories.length !== input.categoryIds.length) throw new MainError('position', 'positionCategoryNotExists');
      await result.setCategories(categories, {transaction: t});
    }

    if (!_.isUndefined(input.skills)) await tag.retag('PositionSkill', result.id, _.map(input.skills, 'name'));

    if (input.active) {
      await models.Enterprise.update({
        positionQuota: models.sequelize.literal('"positionQuota" - 1')
      }, {
        where: {
          id: company.enterpriseId
        },
        limit: 1,
        transaction: t
      });

      if (company.isVIP) {
        let data = {
          companyId: company.id,
          positionId: result.id,
          title: `${company.name} `,
        };

        await models.CompanyDynamic.create(data, {transaction: t});
      }
    }

    await t.commit();
    req.params.positionId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {put} /company/companyId/positions/id Update the position information
 *  @apiName  UpdatePosition
 *  @apiGroup Position
 *
 *
 *  @apiParam {Number} companyId   Company unique ID.
 *  @apiParam {Number} id  Position unique Id
 *
 *  @apiSuccess {String} name  Position name.
 *  @apiSuccess {String} type  Position type.
 *  @apiSuccess {Number} minSalary   Position minSalary.
 *  @apiSuccess {Number} maxSalary   Position maxSalary.
 *  @apiSuccess {Number} educationId   Education unique Id
 *  @apiSuccess {String} experience  Education experience.
 *  @apiSuccess {String} temptation  Education temptation.
 *  @apiSuccess {String}  address  Education address.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.update = async function (req, res, next) {
  debug('Enter update method!');
  const rules = {
    name: 'min:2',
    type: 'in:full-time,part-time,internship,freelance,others',
    minSalary: 'integer',
    maxSalary: 'integer',
    experience: 'in:0,0.5,1,2,3,4,5,5+',
    educationLevelId: 'integer|exists:EducationLevel,id',
    postedDate: 'date',
    expiredDate: 'date',
    companyId: 'integer|exists:Company,id',
    categoryIds: 'array',
    'categoryIds.*': 'integer',
    active: 'boolean',
    email: 'min:1|string',
    temptation: 'min:0',
    address: 'min:0',
    salaryType: 'min:1|in:monthly,hourly,yearly',
    description: 'min:0',
    locationId: 'min:1|integer|exists:Location,id',
    jobNatureId: 'min:1|integer|exists:JobNature,id',
    skills: 'array',
    'skills.*.name': 'requiredIf:skills|min:1',
  };
  let input = validateHelper.pick(req.body, rules, ['categoryIds.*', 'skills.*', 'tags.*']);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Position.findOne({
      where: {
        id: req.params.positionId,
      },
      transaction: t
    });
    if (result === null) throw new MainError('common', 'notFound');

    // check location
    if (!_.isUndefined(input.locationId)) {
      let locations = await models.Location.findAllByIdAndFilterHasNotChildren(input.locationId);
      if (locations.length !== 1) throw new MainError('position', 'LocationNotExists');
    }

    if (!_.isUndefined(input.categoryIds)) {
      let categories = await models.PositionCategory.findAllByIdAndFilterHasNotChildren(input.categoryIds);
      if (categories.length !== input.categoryIds.length) throw new MainError('position', 'positionCategoryNotExists');
      await result.setCategories(categories, {transaction: t});
    }

    await result.updateAttributes(input, {transaction: t});

    if (!_.isUndefined(input.skills)) await tag.retag('PositionSkill', result.id, _.map(input.skills, 'name'));

    if (input.active) {
      // update enterprise's positionQuota
      let company = await models.Company.findOne({where: {id: result.companyId}, transaction: t});
      await models.Enterprise.update({
        positionQuota: models.sequelize.literal('"positionQuota" - 1')
      }, {
        where: {
          id: company.enterpriseId
        },
        limit: 1,
        transaction: t
      });

      if (company.isVIP) {
        let data = {
          companyId: company.id,
          positionId: result.id,
          title: `${company.name} `,
        };

        await models.CompanyDynamic.create(data, {transaction: t});
      }

    }

    await t.commit();
    req.params.positionId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /company/companyId/positions/id Delete the position information
 *  @apiName  DeletePosition
 *  @apiGroup Position
 *
 *  @apiParam {Number} id   Positions unique ID.
 *  @apiParam {Number} companyId   Company unique ID.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.destroy = async function (req, res, next) {
  debug('ENTER destroy method!');

  try {
    let result = await models.Position.findOne({
      where: {
        id: req.params.positionId,
      },
    });
    if (result === null) throw new MainError('common', 'notFound');
    await result.destroy();
    return res.return();
  } catch (err) {
    return next(err);
  }
};

/**
 * similar position
 * @type {Function}
 */
Route.byPublicSimilarPosition = async function (req, res, next) {
  debug('Enter by public similar position method!');
  const rules = {
    active: 'boolean',
    categoryIds: 'array',
    'categoryIds.*': 'integer',
    minExpiredDate: 'date',
  };


  let input = validateHelper.pick(req.query, rules, ['categoryIds.*']);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let scopes = ['includeIndexCompanyWithSearch'];
  let filter = {where: {}};
  filter.include = [];

  if (!_.isUndefined(input.minExpiredDate)) filter.where.expiredDate = {$gte: input.minExpiredDate};
  if (!_.isUndefined(input.active)) filter.where.active = input.active;
  if (!_.isUndefined(input.categoryIds)) {
    filter.include.push({
      model: models.PositionCategory, as: 'categories',
      through: {model: models.PositionCategoryMap, as: 'positionCategoryMap'},
      where: {
        id: {
          $in: input.categoryIds
        }
      }
    });
  }

  // attribute handle
  filter.attributes = ['id'];
  try {
    let positions = await models.Position.scope(scopes).findAll(filter);

    let orderFilter = await res.paginatorHelper.initFilter(req.query);
    orderFilter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.Position.getReadAttributesByRole('index'));

    orderFilter.where = {
      id: {$in: _.map(positions, 'id')}
    };
    orderFilter.order = [[{
      model: models.Company,
      as: 'company'
    }, 'isVIP', 'DESC'], ['updatedAt', 'DESC'], ["view", 'DESC']];

    scopes.push('includeEducation', 'includeLocation', 'includeIndexCompany');

    let result = await models.Position.scope(scopes).findAndCountAll(orderFilter);

    result.count = positions.length;
    return res.paginatorWithCount(result, {}, orderFilter);
  } catch (err) {
    return next(err);
  }
};

Route.indexByCompanyName = async function (req, res, next) {
  debug('Enter indexByCompanyName method!');

  const rules = {
    search: 'min:1'
  };

  let input = validateHelper.pick(req.query, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {where: {}};
  if (!_.isUndefined(input.search && input.search !== '')) {
    filter.where.name = {$iLike: '%' + input.search + '%'};
  }

  try {
    let result = await models.Company.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    req.query.companyId = result.id;
    delete req.query.search;
    return Route.index(req, res, next);
  } catch (err) {
    return next(err);
  }

};

Route.updateByCompany = async function (req, res, next) {
  debug('Enter updateByCompany method!');

  try {
    let result = await models.Position.findOne({
      where: {
        id: req.params.positionId,
        companyId: req.body.companyId,
      }
    });
    if (result === null) throw new MainError('common', 'notFound');

    return Route.update(req, res, next);
  } catch (err) {
    next(err);
  }
};

Route.destroyByCompany = async function (req, res, next) {
  debug('ENTER destroyByCompany method!');

  try {
    let result = await models.Position.findOne({
      where: {
        id: req.params.positionId,
        companyId: req.params.companyId
      },
    });
    if (result === null) throw new MainError('common', 'notFound');
    await result.destroy();
    return res.return();
  } catch (err) {
    return next(err);
  }
};

Route.clickTraffic = async function (req, res, next) {
  debug('ENTER click traffic method!');

  const rules = {
    active: 'boolean',
    minExpiredDate: 'date',
  };
  let input = _.pick(req.query, Object.keys(rules));
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.positionId,
    }
  };
  if (!_.isUndefined(input.minExpiredDate)) filter.where.expiredDate = {$gte: input.minExpiredDate};
  if (!_.isUndefined(input.active)) filter.where.active = input.active;

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Position.findOne(filter);
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

Route.skillCompared = async function (req, res, next) {
  debug('ENTER skill compared method!');

  const rules = {
    userId: 'integer|exists:User,id',
    positionId: 'integer|exists:Position,id,active,true',
  };
  let input = validateHelper.pick(req.params, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let userSkillResult = await models.User.scope(['includeUserSkills']).findById(input.userId);
    let positionSkillResult = await models.Position.scope(['includePositionSkills']).findById(input.positionId);
    let userSkills = [];
    let skillResult = [];
    _.each(userSkillResult.skills, function (userSkill) {
      userSkills.push(userSkill.name);
    });
    _.each(positionSkillResult.skills, function (positionSkill) {
      let index = _.indexOf(userSkills, positionSkill.name);
      skillResult.push(userSkills[index]);
    });
    // 去除重复.
    let skills = _.uniq(skillResult);
    return res.item({skills});
  } catch (err) {
    return next(err);
  }
};

Route.candidateChart = async function (req, res, next) {
  debug('Enter candidateChart method!');

  try {
    let result = await positionMethod.getCandidateChartByPositionId(req.params.positionId);
    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

Route.export = async function (req, res, next) {
  debug('Enter export method!');

  try {
    let result = await models.Position.findAll({order: [['id', 'ASC']]});

    let data = [];
    result.forEach((val) => {
      val = val.toJSON();
      if (data.length === 0) {
        data.push(Object.keys(val));
      }
      let position = Object.values(val);
      data.push(position);
    });

    let path = __base + 'backend/assets/position.xlsx';
    let buffer = xlsx.build([{name: 'position', data: data}]);
    fs.writeFileSync(path, buffer, 'binary');
    res.item('./assets/position.xlsx');
  } catch (err) {
    next(err);
  }
}
