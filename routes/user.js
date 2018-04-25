'use strict';

// core
const debug = require('debug')('APP:USER');


// model
const models = require(__base + 'models');

// library
const _ = require('lodash');
const indicative = require('indicative');
const validateHelper = require(__base + 'helpers/ValidateHelper');
const tag = require(__base + 'methods/tag');
const path = require('path');
const randomstring = require("randomstring");

const s3 = require(__base + 'modules/s3');

const fs = require('fs');
const xlsx = require('node-xlsx');

let Route = module.exports = {};

/**
 *  @api {get} /users Get all the users information
 *  @apiName  GetUsers
 *  @apiGroup User
 *
 *  @apiParam  {String} lastName   User last name.
 *  @apiParam  {String} firstName   User first name.
 *  @apiParam  {String} username   User name.
 *  @apiParam  {String} mobilePhone   User mobile phone.
 *  @apiParam  {String} homePhone   User home phone.
 *
 *  @apiSuccess {Number} id  Users unique ID.
 *  @apiSuccess {Number} profilePictureId   Users profile picture ID.
 *  @apiSuccess {Number} masterUserId  Master user table and user table link field.
 *  @apiSuccess {String} lastName  User last name.
 *  @apiSuccess {String} firstName  User first name.
 *  @apiSuccess {Boolea} active   Active user account,default 'true'.
 *  @apiSuccess {String} username   User name.
 *  @apiSuccess {Enum}   gender   User gender,default 'M'('M', 'F').
 *  @apiSuccess {Date} birth  User birth.
 *  @apiSuccess {Number} nationalityId  User nationality ID.
 *  @apiSuccess {Enum}  marital  User marital status,default ('single', 'married', 'divorced', 'widowed', 'civil_partnership', 'other').
 *  @apiSuccess {Enum}  yearOfExperience  User year of experience,default ('0', '0.5', '1', '2', '3', '4', '5', '5+').
 *  @apiSuccess {String}  phone  User mobile phone.
 *  @apiSuccess {String}  profilePrivacy  User profile privacy.
 *  @apiSuccess {String}  selfDescription   Self description.
 *  @apiSuccess {Date}  lastLogin    User last login.
 *  @apiSuccess {String}  rememberToken  User login token.
 *  @apiSuccess {Number}  createdBy  This data created people,storing the user ID.
 *  @apiSuccess {Number}  updatedBy   This data updated people,storing the user ID.
 *  @apiSuccess {Date}  createdAt     This  data created time.
 *  @apiSuccess {Date}  updatedAt     This  data updated time.
 *
 *  @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *              "id": 1,
 *              "profilePictureId": null,
 *              "masterUserId": 1,
 *              "lastName": "zheng",
 *              "firstName": "fei",
 *              "active": true,
 *              "username": null,
 *              "gender": "M",
 *              "birth": null,
 *              "nationalityId": null,
 *              "marital": null,
 *              "yearOfExperience": null,
 *              "phone": null,
 *              "profilePrivacy": null,
 *              "selfDescription": null,
 *              "lastLogin": null,
 *              "rememberToken": null,
 *              "createdBy": null,
 *              "updatedBy": null,
 *              "createdAt": "2016-03-25T09:02:09.028Z",
 *              "updatedAt": "2016-03-25T09:02:09.028Z"
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
      },
      email: {
        $iLike: '%' + input.search + '%'
      }
    };
  }

  if (!_.isUndefined(input.email)) filter.where.email = {$iLike: '%' + input.email + '%'};
  if (!_.isUndefined(input.active)) filter.where.active = input.active;


  filter.order = [['updatedAt', 'DESC']];

  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.User.getAttributes(), ['updatedAt', 'profilePictureId', 'nationalityId']);

  let scopes = ['includeIcon'];
  try {

    let result = await models.User.scope(scopes).findAndCountAll(filter);

    return res.paginatorWithCount(result, {}, filter);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {get} /users/id(self) Get of the user information
 *  @apiName  Get User
 *  @apiGroup User
 *
 *  @apiParam  {Number} id(self) Users unique ID.
 *
 *  @apiError id The <code>id</code> of the User was not found.
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
      id: req.params.userId
    },
  };

  // attribute handle
  filter.attributes = validateHelper.readAttributeFilter(req.query.attributes, models.User.getAttributes(), ['updatedAt', 'countryId', 'userId']);

  try {
    let result = await models.User.scope(['includeIcon', 'includeUserExperiences', 'includeUserEducations',
      'includeUserSkills', 'includeUserPortfolios', 'includeUserExpectJobs', 'includeUserPictures', 'includeUserLanguages', 'includeFile','includeCompanies','includeUserInterlocutor']).findOne(filter);

    return res.item(result);
  } catch (err) {
    return next(err);
  }
};

/**
 *  @api {post} /users Create of the user information
 *  @apiName  Create User
 *  @apiGroup User
 *
 *  @apiParam {String} lastName  User last name.
 *  @apiParam {String} firstName  User first name.
 *  @apiParam {String} username   User name.
 *  @apiParam {String}  mobilePhone  User mobile phone.
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
    phone: 'min:1',
    gender: 'in:M,F',
    birth: 'date',
    active: 'boolean',
    nationalityId: 'integer|exists:Country,id',
    yearOfExperience: 'in:0,0.5,1,2,3,4,5,5+',
    selfDescription: 'min:1',
    profilePrivacy: 'boolean',
    skills: 'array',
    'skills.*.name': 'requiredIf:skills|min:1',
  };
  let input = validateHelper.pick(req.body, rules, ['skills.*']);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.User.create(input, {transaction: t});

    if (!_.isUndefined(input.skills)) await tag.retag('UserSkill', result.id, _.map(input.skills, 'name'));

    await t.commit();

    req.params.userId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

/**
 *  @api {put} /users/id(self) Update of the user information
 *  @apiName  Update User
 *  @apiGroup User
 *
 *  @apiParam  {Number} id(self) Users unique ID.
 *
 *  @apiSuccess {String} lastName  User last name.
 *  @apiSuccess {String} firstName  User first name.
 *  @apiSuccess {String} username   User name.
 *  @apiSuccess {String}  mobilePhone  User mobile phone.
 *
 *  @apiError id The <code>id</code> of the User was not found.
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
    phone: 'min:1',
    gender: 'in:M,F',
    birth: 'date',
    active: 'boolean',
    nationalityId: 'integer|exists:Country,id',
    yearOfExperience: 'in:0,0.5,1,2,3,4,5,5+',
    selfDescription: 'min:1',
    profilePrivacy: 'boolean',
    skills: 'array',
    'skills.*.name': 'requiredIf:skills|min:1',
  };
  let input = validateHelper.pick(req.body, rules, ['skills.*.name', 'roleIds.*']);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    debug(input, err);
    return res.validateError2(err);
  }

  let filter = {
    where: {
      id: req.params.userId
    }
  };

  let t = await models.sequelize.transaction();
  try {
    let result = await models.User.findOne(filter);
    if (result === null) throw new MainError('common', 'notFound');

    await result.updateAttributes(_.omit(input, ['roleIds', 'skills']), {transaction: t});

    await t.commit();

    if (!_.isUndefined(input.skills)) await tag.retag('UserSkill', result.id, _.map(input.skills, 'name'));

    req.params.userId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {delete} /users/id Delete of the user information
 *  @apiName  Delete User
 *  @apiGroup User
 *
 *  @apiParam  {Number} id Users unique ID.
 *
 *  @apiError id The <code>id</code> of the User was not found.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */

Route.destroy = async function(req, res, next) {
  let t = await models.sequelize.transaction();
  try {

    let filter = {
      where: {
        id: req.params.userId
      },
      transaction: t
    };

    let userResult = await models.User.findOne(filter);
    if (userResult === null) throw new MainError('common', 'notFound');

    await userResult.destroy({transaction: t});
    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

Route.role = async function(req, res, next) {
  const rules = {
    role: 'required|in:user,company',
  };
  let input = validateHelper.pick(req.body, rules);
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    debug(input, err);
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let filter = {
      where: {
        id: req.params.userId
      },
      transaction: t
    };

    let user = await models.User.scope('includeRolePermissions').findOne(filter);
    if (user === null) throw new MainError('common', 'notFound');

    if (user.roles.length > 0) throw new MainError('user', 'existRole');
    let role = await models.Role.findOne({
      where: {
        name: input.role
      },
      transaction: t
    });
    await user.setRoles(role, {transaction: t});

    await t.commit();

    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.uploadFile = async function(req, res, next) {
  debug('Enter upload file method!');

  const rules = {
    file: 'array',
    'file.*':'required'
  };
  let input = _.pick(req.files, Object.keys(rules));
  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let user = await models.User.findById(req.params.userId);
    if (user === null) throw new MainError('common', 'notFound');

    let fileKey = randomstring.generate(24);
    let extname = path.extname(input.file[0].originalname).toLowerCase();
    let filename = path.basename(input.file[0].originalname, extname);
    let extensions = 'pdf,doc,docx'.split(',');

    if (extensions.indexOf(path.extname(input.file[0].originalname).substring(1).toLowerCase()) === -1) {
      throw new MainError('file', 'unsupportedFormat');
    }
    // 文件存放在服务器的位置. ${extname}
    let cloudPath = `user/${user.id}/file/${fileKey}${extname}`;

    await s3.upload(input.file[0].path, cloudPath);

    // remove old file if uploading file
    let userFile = await models.UserFile.findOne({
      where: {userId: req.params.userId}
    });
    if (userFile !== null) {
      await userFile.destroy({transaction: t});
    }

    // Insert into user file table.
    let userFileAttributes = {};
    userFileAttributes.userId = req.params.userId;
    userFileAttributes.name = !_.isUndefined(req.body.name) ? _.snakeCase(req.body.name) : filename;
    userFileAttributes.mime = input.file[0].mimetype;
    userFileAttributes.size = input.file[0].size;
    userFileAttributes.key = fileKey;
    userFileAttributes.extension = extname.substring(1);
    let result = await models.UserFile.create(userFileAttributes, {transaction: t});
    await t.commit();

    req.params.fileId = result.id;
    return Route.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

Route.export = async function (req,res,next) {
  debug('Enter export method!');

  try {
    let result = await models.User.findAll({order:[['id', 'ASC']]});

    let data = [];
    result.forEach((val)=>{
      val = val.toJSON();
      if(data.length === 0){
        data.push(Object.keys(val));
      }

      let user = Object.values(val);
      data.push(user);
    });

    let path = __base + 'backend/assets/user.xlsx';
    let buffer = xlsx.build([{name: 'user', data: data}]);
    fs.writeFileSync(path, buffer, 'binary');
    res.item('./assets/user.xlsx');
  } catch (err) {
    next(err);
  }
}
