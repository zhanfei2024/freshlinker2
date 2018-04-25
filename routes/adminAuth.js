'use strict';

// core
const debug = require('debug')('APP:ADMIN_AUTH');

// model
const models = require(__base + 'models');
const bcrypt = require('bcryptjs');

// library
const _ = require('lodash');
const indicative = require('indicative');

// jwt
const jwt = require('jsonwebtoken');
const jwtConfig = require(__base + 'config/auth');
const uuid = require('uuid');

// email

const adminRoute = require(__base + 'routes/admin');

let Route = module.exports = {};

/**
 *  @api {post} /admin_auth/login  admin Login info
 *  @apiName  LoginAdmin
 *  @apiGroup AdminAuth
 *
 *  @apiParam  {String} email  Admin email.
 *  @apiParam  {String} password   Admin password.
 *
 *  @apiErrorExample {json} Error-Response:
 *   HTTP/1.1 400  Bad Request
 *  {
 *      "status": false,
 *      "message": "Not Found"
 *  }
 */
Route.login = async function (req, res, next) {
  debug('Enter login method!');

  const rules = {
    email: 'required|email|min:6|max:100',
    password: 'required|min:6',
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let result = await models.Admin.findOne({where: {email: req.body.email}, transaction: t});
    if (result === null) throw new MainError('auth', 'doNotHaveAccount');
    debug('Enter login method!');
    let matchPassword = await new Promise(function (resolve, reject) {
      bcrypt.compare(req.body.password, result.password, function (err, active) {
        resolve(active);
      });
    });
    if (matchPassword === false) throw new MainError('auth', 'emailOrPasswordIncorrect');

    let jti = uuid.v4();
    let token = jwt.sign({type: 'admin', adminId: result.id}, jwtConfig.secret, {
      algorithm: 'HS256',
      issuer: 'worktask.io',
      jwtid: jti
    });

    let session = await models.AdminSession.findOne({where: {adminId: result.id, token: jti}, transaction: t});
    if (session === null) {
      await models.AdminSession.create({
        adminId: result.id,
        token: jti,
        agent: req.headers[ 'user-agent' ],
        ip: req.ip,
        lastUsedAt: new Date()
      }, {transaction: t});
    }
    await t.commit();
    debug('CHECK Login success.');
    return res.item(token);
  } catch (err) {
    await t.rollback();
    return next(err);
  }

};

/**
 *  @api {post} /admin_auth/register  Admin register info
 *  @apiName  RegisterAdmin
 *  @apiGroup AdminAuth
 *
 *  @apiParam  {String} email  Admin email.
 *  @apiParam  {String} password   Admin password.
 *  @apiParam  {String}  lastName  Admin last name.
 *  @apiParam  {String}  firstName Admin first name.
 *  @apiParam  {String}  mobilePhone Admin mobile phone.
 *  @apiParam  {String}  homePhone Admin home phone.
 *
 */
Route.register = async function(req, res, next) {
  debug('Enter register method!');
  debug('Enter verification');

  const rules = {
    firstName: 'required|min:1',
    lastName: 'required|min:1',
    email: 'required|email|min:6|max:100',
    password: 'required|min:6',
    mobilePhone: 'min:0'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();
  try {
    let attributes = _.pick(req.body, models.Admin.getAttributes());

    debug('Verify that the admin is empty.');
    let result = await models.Admin.findOne({where: {email: attributes.email}, transaction: t});
    if (result !== null) throw new MainError('master_auth', 'userAlreadyExists');

    debug('Admin register.');
    debug('Create new admin.');
    let admin = await models.Admin.create(attributes, {transaction: t});

    await t.commit();
    debug('Start send email.');
    if (admin !== null) {
      // 待发送验证码
      //email.sendEmail(user, masterUser, 'register');
    } else {
      throw new MainError('master_auth', 'registrationFailed');
    }
    debug('Admin registered success.');
    req.params.id = admin.id;
    // User model
    return adminRoute.show(req, res, next);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {post} /admin_auth/forget_password  Forget password info
 *  @apiName  ForgetPassword
 *  @apiGroup AdminAuth
 *
 *  @apiParam  {String} email  Master user email.
 *
 */
Route.forgetPassword = async function (req, res, next) {
  debug('Enter forgetPassword method!');
  debug('Enter verification');

  const rules = {
    email: 'required|email|min:6|max:100'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  try {
    let t = await models.sequelize.transaction();
    let result = await models.Admin.findOne({where: {email: req.body.email}, transaction: t});
    if (result === null)  throw new MainError('common', 'notFound');

    debug('Verify if the time zone is expired');
    // 验证verifyTime 日期大于24小时,token失效.
    let currentDate = new Date();
    if (!_.isUndefined(result.verifyTime) && (currentDate - result.verifyTime) < 86400000)
      throw new MainError('master_auth', 'tokenAlreadyExists');

    let jti = uuid.v4();
    let token = jwt.sign({type: 'admin', adminId: result.id}, jwtConfig.secret, {
      algorithm: 'HS256',
      issuer: 'worktask.io',
      jwtid: jti
    });

    // 更新 admin 表中 token,verlifyTime字段
    let attributes = models.Admin.getAttributes();
    attributes.token = token;
    attributes.verifyTime = new Date();
    let adminResult = await result.updateAttributes(attributes, {transaction: t});
    if (adminResult === null)  throw new MainError('common', 'notFound');

    debug('Send email.');
    //email.sendEmail(userResult, result, 'forgetPassword');
    await t.commit();
    return res.item(adminResult);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {post} /admin_auth/reset_password  Reset password info
 *  @apiName  ResetPassword
 *  @apiGroup AdminAuth
 *
 *  @apiParam  {String} password   New admin password.
 *  @apiParam  {String}  repassword  Repassword.
 *
 */
Route.resetPassword = async function (req, res, next) {
  debug('Enter resetPassword method!');
  debug('Enter verification');

  const rules = {
    email: 'required|email|min:6|max:100',
    token: 'required|min:1',
    password: 'required|min:6',
    repassword: 'required|min:6'
  };
  let input = _.pick(req.body, Object.keys(rules));

  try {
    await indicative.validate(input, rules, res.validatorMessage);
  } catch (err) {
    return res.validateError2(err);
  }

  let t = await models.sequelize.transaction();

  try {
    let attributes = _.pick(req.body, [ 'email', 'token', 'password', 'repassword' ]);

    let adminResult = await models.Admin.findOne({
      where: {email: attributes.email, token: attributes.token},
      transaction: t
    });
    if (adminResult === null) throw new MainError('master_auth', 'notFoundOrResetPassword');

    debug('Verify if the time zone is expired');
    // 验证verifyTime 日期大于24小时,token失效.
    let currentDate = new Date();
    if ((currentDate - adminResult.verifyTime) > 86400000) throw new MainError('master_auth', 'tokenDateFailure');

    debug('Verify the second password is equal.');
    if (!_.isEqual(attributes.repassword, attributes.password)) throw new MainError('master_auth', 'repassword');

    let result = await adminResult.updateAttributes(attributes, {transaction: t});
    // 如果用户已经点击URL 重置密码,这里将清空token 和 verifyTime
    if (result !== null) {
      attributes.token = null;
      attributes.verifyTime = null;
      await adminResult.updateAttributes(attributes, {transaction: t});
    } else {
      throw new MainError('common', 'notFound');
    }
    await t.commit();

    debug('Send email');
    //email.sendEmail(userResult, masterUser, 'resetPassword');
    return res.return();
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

/**
 *  @api {post} /admin_auth/logout  Admin logout info
 *  @apiName  LogoutMasterUser
 *  @apiGroup  AdminAuth
 *
 */
Route.logout = async function (req, res, next) {
  debug('Enter logout method!');
  try {
    if (res.locals.adminAuth === null) throw new MainError('auth', 'invalidJWT');

    let result = await models.AdminSession.destroy({where: {adminId: res.locals.adminAuth.id}});
    if (result === null) throw new MainError('common', 'notFound');

    return res.return();
  } catch (err) {
    return next(err);
  }
};



