'use strict';

// core
const debug = require('debug')('APP:ROUTE');

// config
const commonConfig = require(__base + 'config/common');

/**
 *
 * Method
 * @module Method
 */
module.exports = function (app) {

  // middleware define
  const userJwtAuthMiddleware = require(__base + 'middlewares/user_jwt_auth_middleware');
  const adminJwtAuthMiddleware = require(__base + 'middlewares/admin_jwt_auth_middleware');
  const enterpriseJwtAuthMiddleware = require(__base + 'middlewares/enterprise_jwt_auth_middleware');
  const jwtMiddleware = require(__base + 'middlewares/jwt_middleware');

  const fromS3GetFileRoute = require(__base + 'routes/fromS3GetFile');

  app.get('/files/*?/company/:companyId([0-9]+)/picture/:key/original.:ext', fromS3GetFileRoute.getResizeImage);
  app.get('/files/*?/company/:companyId([0-9]+)/files/:key/original.:ext', fromS3GetFileRoute.getCompanyFile);
  app.get('/files/*?/companyDynamic/:companyDynamicId([0-9]+)/picture/:key/original.:ext', fromS3GetFileRoute.getResizeImage);
  app.get('/files/*?/user/:userId([0-9]+)/picture/:key/original.:ext', fromS3GetFileRoute.getResizeImage);
  app.get('/files/*?/portfolio/:portfolioId([0-9]+)/picture/:key/original.:ext', fromS3GetFileRoute.getResizeImage);
  app.get('/files/*?/static/:year([0-9]+){4}/:month([0-9]+){2}/:key.:ext', fromS3GetFileRoute.getResizeImage);
  app.get('/files/*?/post/:postId([0-9]+)/image/:key/original.:ext', fromS3GetFileRoute.getResizeImage);
  app.get('/files/user/:userId([0-9]+)/file/:key.:ext', fromS3GetFileRoute.getUserFile);


  /***********************************************
   *
   *
   * 公开路由
   *
   *
   ***********************************************/
  const apiPublicPath = commonConfig.apiPath + '/public';

  const countryRoute = require(__base + 'routes/country');
  const currencyRoute = require(__base + 'routes/currency');
  const educationLevelRoute = require(__base + 'routes/educationLevel');
  const languageRoute = require(__base + 'routes/language');
  const locationRoute = require(__base + 'routes/location');
  const postCategoryRoute = require(__base + 'routes/postCategory');
  const positionCategoryRoute = require(__base + 'routes/positionCategory');
  const schoolRoute = require(__base + 'routes/school');
  const staticImageRoute = require(__base + 'routes/staticImage');
  const tagRoute = require(__base + 'routes/tag');

  const publicPositionRoute = require(__base + 'routes/public/position');
  const publicCompanyRoute = require(__base + 'routes/public/company');
  const publicCompanyPictureRoute = require(__base + 'routes/public/companyPicture');
  const publicPostRoute = require(__base + 'routes/public/post');
  const publicCommentRoute = require(__base + 'routes/public/comment');
  const publicReviewRoute = require(__base + 'routes/public/review');
  const publicCompanyDynamicRoute = require(__base + 'routes/public/companyDynamic');
  const publicCompanyAwardRoute = require(__base + 'routes/public/companyAward');
  const publicCompanyWelfareRoute = require(__base + 'routes/public/companyWelfare');
  const publicCompanyFileRoute = require(__base + 'routes/public/companyFile');
  const publicAuthRoute = require(__base + 'routes/public/auth');

  const resumeRoute = require(__base + 'routes/public/user');
  const positionInvitationRoute = require(__base + 'routes/public/positionInvitation');
  const jobNatureRoute = require(__base + 'routes/public/jobNature');

  const publicPlanRoute = require(__base + 'routes/plan');
  const publicSettingRoute = require(__base + 'routes/setting');
  //const methodRoute = require(__base + 'methods/positionMethod'); // test 勿删
  //app.get(`${apiPublicPath}/overdue`, function () {
  //  methodRoute.pushExpiredEmail();
  //});// test 勿删

  /***
   * 用户是否存在
   */

  app.get(`${apiPublicPath}/auth`,publicAuthRoute.confirm);

  /**
   * 职位邀请，过滤用户
   */
    //TODO should be removed
  const filterUsersRoute = require(__base + 'methods/positionInvitationMethod');
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/position_invitations`, filterUsersRoute.matchUserAndSendInvitation);

  /**
   * 职位
   *
   */
  app.get(`${apiPublicPath}/positions`, publicPositionRoute.index);
  // 相似职位
  app.get(`${apiPublicPath}/positions/by_similar_position`, publicPositionRoute.bySimilarPosition);
  // 职位按职位大类显示.
  app.get(`${apiPublicPath}/positions/categories_position`, publicPositionRoute.categoriesPosition);
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/positions`, publicPositionRoute.indexByCompany);
  app.get(`${apiPublicPath}/positions/by_company_name`, publicPositionRoute.indexByCompanyName);
  app.get(`${apiPublicPath}/positions/:positionId([0-9]+)`, publicPositionRoute.show);

  // 统计图
  app.get(`${apiPublicPath}/positions/:positionId([0-9]+)/chart`, publicPositionRoute.candidateChart);

  // 职位点击量
  app.post(`${apiPublicPath}/positions/:positionId([0-9]+)/click_traffic`, publicPositionRoute.clickTraffic);

  /**
   *  邀請職位
   */
  app.get(`${apiPublicPath}/positionInvitation/positions`, positionInvitationRoute.byInvitationPosition);


  /**
   * plans
   */
  app.get(`${apiPublicPath}/plans`, publicPlanRoute.index);
  app.get(`${apiPublicPath}/plans/:planId([0-9]+)`, publicPlanRoute.show);


  /**
   * 简历
   */
  app.get(`${apiPublicPath}/users/:userId([0-9]+)`, resumeRoute.show);

  /**
   * 职位分类
   *
   */
  app.get(`${apiPublicPath}/position_categories`, positionCategoryRoute.index);
  app.get(`${apiPublicPath}/position_categories/tree`, positionCategoryRoute.indexTree);
  app.get(`${apiPublicPath}/position_categories/:categoryId([0-9]+)`, positionCategoryRoute.show);

  /**
   * 文章
   */
  app.get(`${apiPublicPath}/posts`, publicPostRoute.index);
  app.get(`${apiPublicPath}/posts/:postId([0-9]+)`, publicPostRoute.show);
  app.post(`${apiPublicPath}/posts/:postId([0-9]+)/click_traffic`, publicPostRoute.clickTraffic);

  /**
   * 评论
   */
  app.get(`${apiPublicPath}/comments`, publicCommentRoute.index);
  app.get(`${apiPublicPath}/posts/:postId([0-9]+)/comments`, publicCommentRoute.index);
  app.get(`${apiPublicPath}/comments/:commentId([0-9]+)/replies`, publicCommentRoute.index);

  /**
   * 文章分类
   *
   */
  app.get(`${apiPublicPath}/post_categories`, postCategoryRoute.index);
  app.get(`${apiPublicPath}/post_categories/tree`, postCategoryRoute.indexTree);
  app.get(`${apiPublicPath}/post_categories/:categoryId([0-9]+)`, postCategoryRoute.show);

  /**
   * 公司
   *
   */
  app.get(`${apiPublicPath}/companies`, publicCompanyRoute.index);
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)`, publicCompanyRoute.show);
  app.post(`${apiPublicPath}/companies/:companyId([0-9]+)/click_traffic`, publicCompanyRoute.clickTraffic);

  /**
   * 公司展示图片
   */
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/pictures`, publicCompanyPictureRoute.index);
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/pictures/:pictureId([0-9]+)`, publicCompanyPictureRoute.show);

  /**
   * position job nature
   */
  app.get(`${apiPublicPath}/jobNatures`, jobNatureRoute.index);
  app.get(`${apiPublicPath}/jobNatures/:jobNatureId([0-9]+)`, jobNatureRoute.show);

  /**
   * 面試評論
   */
  app.get(`${apiPublicPath}/reviews`,publicReviewRoute.index);
  app.get(`${apiPublicPath}/reviews/:reviewId([0-9]+)`,publicReviewRoute.show);

  /**
   * 公司動態
   */
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/companyDynamics`,publicCompanyDynamicRoute.index);
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/companyDynamics/:companyDynamicId([0-9]+)`,publicCompanyDynamicRoute.show);

  /**
   * 公司獎項
   */
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/companyAwards`,publicCompanyAwardRoute.index);
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/companyAwards/:companyAwardId([0-9]+)`,publicCompanyAwardRoute.show);

  /**
   * 公司福利
   */
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/companyWelfares`,publicCompanyWelfareRoute.index);
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/companyWelfares/:companyWelfareId([0-9]+)`,publicCompanyWelfareRoute.show);

  /**
   * 公司文件
   */
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/files`,publicCompanyFileRoute.index);
  app.get(`${apiPublicPath}/companies/:companyId([0-9]+)/files/:fileId([0-9]+)`,publicCompanyFileRoute.show);

  /**
   * 其他路由
   *
   */
  app.get(`${apiPublicPath}/locations`, locationRoute.index);
  app.get(`${apiPublicPath}/locations/tree`, locationRoute.indexTree);
  app.get(`${apiPublicPath}/locations/:locationId([0-9]+)`, locationRoute.show);

  app.get(`${apiPublicPath}/currencies`, currencyRoute.index);
  app.get(`${apiPublicPath}/currencies/:id([0-9]+)`, currencyRoute.show);

  app.get(`${apiPublicPath}/countries`, countryRoute.index);
  app.get(`${apiPublicPath}/countries/:id([0-9]+)`, countryRoute.show);

  app.get(`${apiPublicPath}/education_levels`, educationLevelRoute.index);
  app.get(`${apiPublicPath}/education_levels/:id([0-9]+)`, educationLevelRoute.show);

  app.get(`${apiPublicPath}/languages`, languageRoute.index);
  app.get(`${apiPublicPath}/languages/:languageId([0-9]+)`, languageRoute.show);

  app.get(`${apiPublicPath}/schools`, schoolRoute.index);
  app.get(`${apiPublicPath}/schools/educations`, schoolRoute.indexByEducation);
  app.get(`${apiPublicPath}/schools/:schoolId([0-9]+)`, schoolRoute.show);

  // 搜索有关 TAG 关键字
  app.get(`${apiPublicPath}/tags`, tagRoute.index);

  // 获取首页轮播图 職位數量
  app.get(`${apiPublicPath}/settings/:settingId([0-9]+)`, publicSettingRoute.show);

  /***********************************************
   *
   *
   * 管理员路由
   *
   *
   ***********************************************/
  const apiAdminPath = commonConfig.apiPath + '/admin';
  const userRoute = require(__base + 'routes/user');
  const enterpriseRoute = require(__base + 'routes/enterprise');
  const planRoute = require(__base + 'routes/plan');
  const adminRoute = require(__base + 'routes/admin');
  const adminAuthRoute = require(__base + 'routes/adminAuth');
  const settingRoute = require(__base + 'routes/setting');
  const postRoute = require(__base + 'routes/post');
  const commentRoute = require(__base + 'routes/comment');
  const positionRoute = require(__base + 'routes/position');
  const positionInvitationJobRoute = require(__base + 'routes/positionInvitationJob');
  const reviewRoute = require(__base + 'routes/review');
  const companyRoute = require(__base + 'routes/company');
  const companyDynamicRoute = require(__base + 'routes/companyDynamic');
  const companyAwardRoute = require(__base + 'routes/companyAward');
  const companyWelfareRoute = require(__base + 'routes/companyWelfare');
  const companyFileRoute = require(__base + 'routes/companyFile');
  const fileRoute = require(__base + 'routes/file');
  const weeklySelectionRoute = require(__base + 'routes/weeklySelection');
  const currencySendEmailRoute = require(__base + 'routes/currencySendEmail');

  /**
   * 认证管理
   */
  app.post(`${apiAdminPath}/admin_auth/login`, adminAuthRoute.login);
  app.post(`${apiAdminPath}/admin_auth/register`, adminAuthRoute.register);
  app.post(`${apiAdminPath}/admin_auth/forget_password`, adminAuthRoute.forgetPassword);
  app.post(`${apiAdminPath}/admin_auth/reset_password`, adminAuthRoute.resetPassword);
  app.post(`${apiAdminPath}/admin_auth/logout`, adminJwtAuthMiddleware, adminAuthRoute.logout);


  app.post(`${apiAdminPath}/*`, adminJwtAuthMiddleware);

  /**
   * 管理员
   */
  app.get(`${apiAdminPath}/admins`, adminRoute.index);
  app.get(`${apiAdminPath}/admins/:id(\\d+|self)`, adminRoute.show);
  app.post(`${apiAdminPath}/admins`, adminRoute.create);
  app.put(`${apiAdminPath}/admins/:id(\\d+|self)`, adminRoute.update);
  app.delete(`${apiAdminPath}/admins/:id([0-9]+)`, adminRoute.destroy);

  /**
   * 批量发送邮件
   */

  //上传附件
  app.post(`${apiAdminPath}/files`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), fileRoute.uploadFile);

  // 删除附件
  app.delete(`${apiAdminPath}/files/:name`, fileRoute.deleteFile);
  // send newsletter
  app.post(`${apiAdminPath}/newsletter`, weeklySelectionRoute.sendNewsletter);

  // send all type email
  app.post(`${apiAdminPath}/email`, currencySendEmailRoute.sendAllTypeEmail);


  /**
   * 文章
   */
  app.get(`${apiAdminPath}/posts`, postRoute.index);
  app.get(`${apiAdminPath}/posts/:postId([0-9]+)`, postRoute.show);
  app.post(`${apiAdminPath}/posts`, postRoute.create);
  app.put(`${apiAdminPath}/posts/:postId([0-9]+)`, postRoute.update);
  app.delete(`${apiAdminPath}/posts/:postId([0-9]+)`, postRoute.destroy);

  /**
   * 评论
   */
  app.get(`${apiAdminPath}/comments`, commentRoute.index);
  app.get(`${apiAdminPath}/posts/:postId([0-9]+)/comments`, commentRoute.index);
  app.get(`${apiAdminPath}/comments/:commentId([0-9]+)/replies`, commentRoute.index);
  app.post(`${apiAdminPath}/posts/:postId([0-9]+)/comments`, commentRoute.create);
  app.post(`${apiAdminPath}/comments/:commentId([0-9]+)/replies`, commentRoute.create);
  app.delete(`${apiAdminPath}/comments/:commentId([0-9]+)`, commentRoute.destroy);

  /**
   * 文章分类
   */
  app.get(`${apiAdminPath}/post_categories`, postCategoryRoute.index);
  app.get(`${apiAdminPath}/post_categories/:categoryId([0-9]+)`, postCategoryRoute.show);
  app.post(`${apiAdminPath}/post_categories`, postCategoryRoute.create);
  app.put(`${apiAdminPath}/post_categories/:categoryId([0-9]+)`, postCategoryRoute.update);
  app.delete(`${apiAdminPath}/post_categories/:categoryId([0-9]+)`, postCategoryRoute.destroy);


  /**
   * 公司
   * - 审批公司
   */
  app.get(`${apiAdminPath}/companies`, companyRoute.index);
  app.get(`${apiAdminPath}/companies/:companyId([0-9]+)`, companyRoute.show);
  app.post(`${apiAdminPath}/companies`, companyRoute.create);
  app.put(`${apiAdminPath}/companies/:companyId([0-9]+)`, companyRoute.update);
  app.delete(`${apiAdminPath}/companies/:companyId([0-9]+)`, companyRoute.destroy);

  /**
   * 职位
   */
  app.get(`${apiAdminPath}/positions`, positionRoute.index);
  app.get(`${apiAdminPath}/positions/:positionId([0-9]+)`, positionRoute.show);
  app.post(`${apiAdminPath}/positions`, positionRoute.create);
  app.put(`${apiAdminPath}/positions/:positionId([0-9]+)`, positionRoute.update);
  app.delete(`${apiAdminPath}/positions/:positionId([0-9]+)`, positionRoute.destroy);

  /**
   * 面試評論
   */
  app.get(`${apiAdminPath}/reviews`, reviewRoute.index);
  app.get(`${apiAdminPath}/reviews/:reviewId([0-9]+)`, reviewRoute.show);
  app.post(`${apiAdminPath}/reviews`, reviewRoute.create);
  app.put(`${apiAdminPath}/reviews/:reviewId([0-9]+)`, reviewRoute.update);
  app.delete(`${apiAdminPath}/reviews/:reviewId([0-9]+)`, reviewRoute.destroy);

  /**
   * 公司動態
   */
  app.get(`${apiAdminPath}/companyDynamics`, companyDynamicRoute.index);
  app.get(`${apiAdminPath}/companyDynamics/:companyDynamicId([0-9]+)`, companyDynamicRoute.show);
  app.post(`${apiAdminPath}/companyDynamics`, companyDynamicRoute.create);
  app.put(`${apiAdminPath}/companyDynamics/:companyDynamicId([0-9]+)`, companyDynamicRoute.update);
  app.delete(`${apiAdminPath}/companyDynamics/:companyDynamicId([0-9]+)`, companyDynamicRoute.destroy);

  /**
   * 公司獎項
   */
  app.get(`${apiAdminPath}/companyAwards`, companyAwardRoute.index);
  app.get(`${apiAdminPath}/companyAwards/:companyAwardId([0-9]+)`, companyAwardRoute.show);
  app.post(`${apiAdminPath}/companyAwards`, companyAwardRoute.create);
  app.put(`${apiAdminPath}/companyAwards/:companyAwardId([0-9]+)`, companyAwardRoute.update);
  app.delete(`${apiAdminPath}/companyAwards/:companyAwardId([0-9]+)`, companyAwardRoute.destroy);

  /**
   * 公司福利
   */
  app.get(`${apiAdminPath}/companyWelfares`, companyWelfareRoute.index);
  app.get(`${apiAdminPath}/companyWelfares/:companyWelfareId([0-9]+)`, companyWelfareRoute.show);
  app.post(`${apiAdminPath}/companyWelfares`, companyWelfareRoute.create);
  app.put(`${apiAdminPath}/companyWelfares/:companyWelfareId([0-9]+)`, companyWelfareRoute.update);
  app.delete(`${apiAdminPath}/companyWelfares/:companyWelfareId([0-9]+)`, companyWelfareRoute.destroy);

  /**
   * 公司文件
   */
  app.get(`${apiAdminPath}/companyFiles`, companyFileRoute.index);
  app.get(`${apiAdminPath}/companyFiles/:fileId([0-9]+)`, companyFileRoute.show);
  app.post(`${apiAdminPath}/companyFiles`, companyFileRoute.create);
  app.delete(`${apiAdminPath}/companyFiles/:fileId([0-9]+)`, companyFileRoute.destroy);

  /**
   * 职位分类
   */
  app.post(`${apiAdminPath}/position_categories`, positionCategoryRoute.create);
  app.put(`${apiAdminPath}/position_categories/:categoryId([0-9]+)`, positionCategoryRoute.update);
  app.delete(`${apiAdminPath}/position_categories/:categoryId([0-9]+)`, positionCategoryRoute.destroy);


  /**
   * 职位邀请
   */
  app.get(`${apiAdminPath}/position_invitation_jobs`, positionInvitationJobRoute.index);
  app.get(`${apiAdminPath}/position_invitation_jobs/:positionInvitationJobId`, positionInvitationJobRoute.show);
  app.put(`${apiAdminPath}/position_invitation_jobs/:positionInvitationJobId`, positionInvitationJobRoute.update);


  /**
   * 用户
   */
  app.get(`${apiAdminPath}/users`, userRoute.index);
  app.post(`${apiAdminPath}/users`, userRoute.create);
  app.get(`${apiAdminPath}/users/:userId([0-9]+)`, userRoute.show);
  app.put(`${apiAdminPath}/users/:userId([0-9]+)`, userRoute.update);
  app.delete(`${apiAdminPath}/users/:userId([0-9]+)`, userRoute.destroy);

  /**
   * 企业
   */
  app.get(`${apiAdminPath}/enterprises`, enterpriseRoute.index);
  app.post(`${apiAdminPath}/enterprises`, enterpriseRoute.create);
  app.get(`${apiAdminPath}/enterprises/:enterpriseId([0-9]+)`, enterpriseRoute.show);
  app.put(`${apiAdminPath}/enterprises/:enterpriseId([0-9]+)`, enterpriseRoute.update);
  app.delete(`${apiAdminPath}/enterprises/:enterpriseId([0-9]+)`, enterpriseRoute.destroy);

  /**
   * 计划
   */
  app.get(`${apiAdminPath}/plans`, planRoute.index);
  app.get(`${apiAdminPath}/plans/:planId([0-9]+)`, planRoute.show);
  app.post(`${apiAdminPath}/plans`, planRoute.create);
  app.put(`${apiAdminPath}/plans/:planId([0-9]+)`, planRoute.update);
  app.delete(`${apiAdminPath}/plans/:planId([0-9]+)`, planRoute.destroy);

  /**
   * 设置
   */
  app.get(`${apiAdminPath}/settings`, settingRoute.index);
  app.get(`${apiAdminPath}/settings/:settingId([0-9]+)`, settingRoute.show);
  app.post(`${apiAdminPath}/settings`, settingRoute.create);
  app.put(`${apiAdminPath}/settings/:settingId([0-9]+)`, settingRoute.update);
  app.delete(`${apiAdminPath}/settings/:settingId([0-9]+)`, settingRoute.destroy);

  /**
   * 系统数据
   */

  app.post(`${apiAdminPath}/education_levels`, educationLevelRoute.create);
  app.put(`${apiAdminPath}/education_levels/:id([0-9]+)`, educationLevelRoute.update);
  app.delete(`${apiAdminPath}/education_levels/:id([0-9]+)`, educationLevelRoute.destroy);

  app.get(`${apiAdminPath}/schools`, schoolRoute.index);
  app.get(`${apiAdminPath}/schools/:schoolId([0-9]+)`, schoolRoute.show);
  app.post(`${apiAdminPath}/schools`, schoolRoute.create);
  app.put(`${apiAdminPath}/schools/:schoolId([0-9]+)`, schoolRoute.update);
  app.delete(`${apiAdminPath}/schools/:schoolId([0-9]+)`, schoolRoute.destroy);

  app.post(`${apiAdminPath}/languages`, languageRoute.create);
  app.put(`${apiAdminPath}/languages/:id([0-9]+)`, languageRoute.update);
  app.delete(`${apiAdminPath}/languages/:id([0-9]+)`, languageRoute.destroy);

  /**
   * 数据导出
   */
  app.get(`${apiAdminPath}/companies/export`, companyRoute.export);
  app.get(`${apiAdminPath}/enterprises/export`, enterpriseRoute.export);
  app.get(`${apiAdminPath}/positions/export`, positionRoute.export);
  app.get(`${apiAdminPath}/posts/export`, postRoute.export);
  app.get(`${apiAdminPath}/users/export`, userRoute.export);

  /***********************************************
   *
   *
   * 用户路由
   *
   *
   ***********************************************/
  const apiUserPath = commonConfig.apiPath + '/user';

  const userUserRoute = require(__base + 'routes/user/user');
  const userPictureRoute = require(__base + 'routes/user/userPicture');
  const userCandidateRoute = require(__base + 'routes/user/userCandidate');
  const userCompanyRoute = require(__base + 'routes/user/userCompany');
  const userUserEducationRoute = require(__base + 'routes/user/userEducation');
  const userUserLanguageRoute = require(__base + 'routes/user/userLanguage');
  const userUserExperienceRoute = require(__base + 'routes/user/userExperience');
  const userUserPortfolioRoute = require(__base + 'routes/user/userPortfolio');
  const userUserPortfolioAttachmentRoute = require(__base + 'routes/user/userPortfolioAttachment');
  const userUserExpectJobRoute = require(__base + 'routes/user/userExpectJob');
  const userPositionInvitationRoute = require(__base + 'routes/user/positionInvitation');
  const userAuthRoute = require(__base + 'routes/user/auth');
  const getPositionQuestionRoute = require(__base + 'routes/user/positionQuestion');
  const userBookmarkRoute = require(__base + 'routes/user/bookmark');
  const userSkillRoute = require(__base + 'routes/user/userSkills');
  const userPostRoute = require(__base + 'routes/user/post');
  const userCommentRoute = require(__base + 'routes/user/comment');
  const userPostImageRoute = require(__base + 'routes/user/postImage');
  const userPositionRoute = require(__base + 'routes/user/positions');
  const userReviewRoute = require(__base + 'routes/user/review');
  const userChatRoute = require(__base + 'routes/user/chat');

  app.use(apiUserPath + '/activate', jwtMiddleware.jwt, jwtMiddleware.checkProvider, userAuthRoute.activate);
  app.use(apiUserPath + '/is_activated', jwtMiddleware.jwt, jwtMiddleware.checkProvider, userAuthRoute.isActivated);
  app.use(apiUserPath + '/*', jwtMiddleware.jwt, jwtMiddleware.checkProvider, userJwtAuthMiddleware);

  // app.use(apiUserPath + '/activate', jwtMiddleware, userAuthRoute.activate);
  // app.use(apiUserPath + '/is_activated', jwtMiddleware, userAuthRoute.isActivated);
  // app.use(apiUserPath + '/*', jwtMiddleware, userJwtAuthMiddleware);


  /**
   * chat
   */
  app.get(`${apiUserPath}/chat/login`, userChatRoute.login);
  app.get(`${apiUserPath}/chat`, userChatRoute.index);
  app.get(`${apiUserPath}/chat/:companyId([0-9]+)`, userChatRoute.show);
  app.post(`${apiUserPath}/chat/:companyId([0-9]+)`, userChatRoute.create);
  app.put(`${apiUserPath}/chat/:companyId([0-9]+)`, userChatRoute.update);
  app.delete(`${apiUserPath}/chat/:companyId([0-9]+)`, userChatRoute.destroy);

  /**
   * 用户
   */
  // 上传头像
  app.post(`${apiUserPath}/users/self/icon`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), userPictureRoute.uploadIcon);
  // 上传user图片
  app.post(`${apiUserPath}/users/self/pictures`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), userPictureRoute.uploadPicture);
  //上传简历
  app.post(`${apiUserPath}/users/self/files`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), userUserRoute.uploadFile);

  app.get(`${apiUserPath}/users/self/pictures`, userPictureRoute.index);
  app.get(`${apiUserPath}/users/self/pictures/:pictureId([0-9]+)`, userPictureRoute.show);
  app.delete(`${apiUserPath}/users/self/pictures/:pictureId([0-9]+)`, userPictureRoute.destroy);
  app.get(`${apiUserPath}/users/self`, userUserRoute.show);
  app.put(`${apiUserPath}/users/self`, userUserRoute.update);
  app.post(`${apiUserPath}/users/self/role`, userUserRoute.role);


  /**
   * 职位申请 & 显示申请职位
   */
  // 显示职位申请所需回答问题
  app.get(`${apiUserPath}/positions/:positionId([0-9]+)/questions`, getPositionQuestionRoute.show);
  // 申请职位
  app.post(`${apiUserPath}/positions/:positionId([0-9]+)/apply`, userCandidateRoute.apply);
  // 检查是否已申请此职位
  app.get(`${apiUserPath}/positions/:positionId([0-9]+)/check`, userCandidateRoute.check);
  // 显位过往所有申请职位
  app.get(`${apiUserPath}/candidates`, userCandidateRoute.index);

  // User 查询.
  app.get(`${apiUserPath}/candidates/list`, userCandidateRoute.index);

  // user skill compared position skill
  app.get(`${apiUserPath}/skills/positions/:positionId([0-9]+)/skill_compared`, userSkillRoute.skillCompared);

  /**
   *公司申请
   */
  app.post(`${apiUserPath}/company/apply`, userCompanyRoute.apply);

  /**
   * 职位邀请
   */
  // 显示 企业所邀请的职位
  app.get(`${apiUserPath}/position_invitations`, userPositionInvitationRoute.index);
  // 拒绝邀请的职位
  app.post(`${apiUserPath}/position_invitations/:positionInvitationId([0-9]+)/reject`, userPositionInvitationRoute.reject);
  // 通过邀请职位,申请此职位,并扣费
  app.post(`${apiUserPath}/position_invitations/:positionInvitationId([0-9]+)/apply`, userCandidateRoute.invitationApply);

  /**
   * 统计图
   */
  app.get(`${apiUserPath}/positions/:positionId([0-9]+)/chart`, userPositionRoute.candidateChart);


  /**
   * 文章
   */
  app.get(`${apiUserPath}/posts`, userPostRoute.index);
  app.get(`${apiUserPath}/posts/:postId([0-9]+)`, userPostRoute.show);
  app.post(`${apiUserPath}/posts`, userPostRoute.create);
  app.put(`${apiUserPath}/posts/:postId([0-9]+)`, userPostRoute.update);
  app.delete(`${apiUserPath}/posts/:postId([0-9]+)`, userPostRoute.destroy);

  /**
   * 评论
   */
  app.get(`${apiUserPath}/comments/read`, userCommentRoute.read);
  app.get(`${apiUserPath}/comments`, userCommentRoute.index);
  app.get(`${apiUserPath}/comments/:commentId([0-9]+)`, userCommentRoute.show);
  app.get(`${apiUserPath}/posts/:postId([0-9]+)/comments`, userCommentRoute.index);
  app.get(`${apiUserPath}/comments/:commentId([0-9]+)/replies`, userCommentRoute.index);
  app.post(`${apiUserPath}/posts/:postId([0-9]+)/comments`, userCommentRoute.create);
  app.post(`${apiUserPath}/comments/:commentId([0-9]+)/replies`, userCommentRoute.create);
  app.put(`${apiUserPath}/comments/:commentId([0-9]+)`, userCommentRoute.update);
  app.delete(`${apiUserPath}/comments/:commentId([0-9]+)`, userCommentRoute.destroy);

  app.post(`${apiUserPath}/comments/:commentId([0-9]+)/like`, userCommentRoute.like);

  /**
   * post 上下线
   */
  app.put(`${apiUserPath}/posts/:postId([0-9]+)/modify_active`, userPostRoute.modifyActive);

  // 上传文章封面
  app.post(`${apiUserPath}/posts/:postId([0-9]+)/cover`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), userPostImageRoute.uploadCover);
  // 上传文章圖片
  app.post(`${apiUserPath}/posts/:postId([0-9]+)/image`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), userPostImageRoute.uploadImage);
  // 删除文章封面
  app.delete(`${apiUserPath}/posts/:postId([0-9]+)/images/:imageId([0-9]+)`, userPostImageRoute.destroy);

  /**
   * 文章图片
   */
  app.post(`${apiUserPath}/upload_images`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), staticImageRoute.uploadImage);

  /**
   * 职位收藏 & 取消收藏职位
   */
  app.get(`${apiUserPath}/bookmarks`, userBookmarkRoute.index);
  app.get(`${apiUserPath}/positions/:positionId([0-9]+)/bookmark`, userBookmarkRoute.show);
  app.post(`${apiUserPath}/positions/:positionId([0-9]+)/bookmark`, userBookmarkRoute.create);
  app.delete(`${apiUserPath}/positions/:positionId([0-9]+)/bookmark`, userBookmarkRoute.destroy);

  /**
   * 面試評論
   */
  app.get(`${apiUserPath}/reviews`, userReviewRoute.index);
  app.get(`${apiUserPath}/reviews/:reviewId([0-9]+)`, userReviewRoute.show);
  app.post(`${apiUserPath}/reviews`, userReviewRoute.create);
  app.delete(`${apiUserPath}/reviews/:reviewId([0-9]+)`, userReviewRoute.destroy);

  /**
   * 用户教育
   */
  app.get(`${apiUserPath}/users/self/educations`, userUserEducationRoute.index);
  app.get(`${apiUserPath}/users/self/educations/:educationId([0-9]+)`, userUserEducationRoute.show);
  app.post(`${apiUserPath}/users/self/educations`, userUserEducationRoute.create);
  app.put(`${apiUserPath}/users/self/educations/:educationId([0-9]+)`, userUserEducationRoute.update);
  app.delete(`${apiUserPath}/users/self/educations/:educationId([0-9]+)`, userUserEducationRoute.destroy);

  /**
   * 用户语言水平
   */
  app.get(`${apiUserPath}/users/self/languages`, userUserLanguageRoute.index);
  app.get(`${apiUserPath}/users/self/languages/:languageId([0-9]+)`, userUserLanguageRoute.show);
  app.post(`${apiUserPath}/users/self/languages`, userUserLanguageRoute.create);
  app.put(`${apiUserPath}/users/self/languages/:languageId([0-9]+)`, userUserLanguageRoute.update);
  app.delete(`${apiUserPath}/users/self/languages/:languageId([0-9]+)`, userUserLanguageRoute.destroy);

  /**
   * 用户经验
   */
  app.get(`${apiUserPath}/users/self/experiences`, userUserExperienceRoute.index);
  app.get(`${apiUserPath}/users/self/experiences/:experienceId([0-9]+)`, userUserExperienceRoute.show);
  app.post(`${apiUserPath}/users/self/experiences`, userUserExperienceRoute.create);
  app.put(`${apiUserPath}/users/self/experiences/:experienceId([0-9]+)`, userUserExperienceRoute.update);
  app.delete(`${apiUserPath}/users/self/experiences/:experienceId([0-9]+)`, userUserExperienceRoute.destroy);

  /**
   * 用户期望工作
   */
  app.get(`${apiUserPath}/users/self/expect_jobs`, userUserExpectJobRoute.index);
  app.get(`${apiUserPath}/users/self/expect_jobs/:expectJobId([0-9]+)`, userUserExpectJobRoute.show);
  app.post(`${apiUserPath}/users/self/expect_jobs`, userUserExpectJobRoute.create);
  app.put(`${apiUserPath}/users/self/expect_jobs/:expectJobId([0-9]+)`, userUserExpectJobRoute.update);
  app.delete(`${apiUserPath}/users/self/expect_jobs/:expectJobId([0-9]+)`, userUserExpectJobRoute.destroy);

  /**
   * 用户作品
   */
  app.get(`${apiUserPath}/users/self/portfolios`, userUserPortfolioRoute.index);
  app.get(`${apiUserPath}/users/self/portfolios/:portfolioId([0-9]+)`, userUserPortfolioRoute.show);
  app.post(`${apiUserPath}/users/self/portfolios`, userUserPortfolioRoute.create);
  app.put(`${apiUserPath}/users/self/portfolios/:portfolioId([0-9]+)`, userUserPortfolioRoute.update);
  app.delete(`${apiUserPath}/users/self/portfolios/:portfolioId([0-9]+)`, userUserPortfolioRoute.destroy);
  // 上传图片
  app.get(`${apiUserPath}/users/self/portfolios/:portfolioId([0-9]+)/pictures`, userUserPortfolioAttachmentRoute.index);
  app.get(`${apiUserPath}/users/self/portfolios/:portfolioId([0-9]+)/pictures/:pictureId([0-9]+)`, userUserPortfolioAttachmentRoute.show);
  app.post(`${apiUserPath}/users/self/portfolios/:portfolioId([0-9]+)/pictures`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), userUserPortfolioAttachmentRoute.uploadPicture);
  app.delete(`${apiUserPath}/users/self/portfolios/:portfolioId([0-9]+)/pictures/:pictureId([0-9]+)`, userUserPortfolioAttachmentRoute.destroy);


  /***********************************************
   *
   *
   * 企业路由
   *
   *
   ***********************************************/
  const apiEnterprisePath = commonConfig.apiPath + '/enterprise';

  const enterpriseCompanyRoute = require(__base + 'routes/enterprise/company');
  const enterpriseCompanyPictureRoute = require(__base + 'routes/enterprise/companyPicture');
  const enterpriseCompanyDynamicPictureRoute = require(__base + 'routes/enterprise/companyDynamicPicture');
  const enterpriseCompanyCandidateRoute = require(__base + 'routes/enterprise/companyCandidate');
  const enterpriseCompanyReviewRoute = require(__base + 'routes/enterprise/review');
  const enterpriseUserCompanyRoute = require(__base + 'routes/enterprise/userCompany');
  const enterprisePositionRoute = require(__base + 'routes/enterprise/position');
  const enterprisePositionQuestionRoute = require(__base + 'routes/enterprise/positionQuestion');
  const enterprisePositionInvitationJobRoute = require(__base + 'routes/enterprise/positionInvitationJob');
  const enterprisePostRoute = require(__base + 'routes/enterprise/post');
  const enterprisePostImageRoute = require(__base + 'routes/enterprise/postImage');
  const enterpriseCompanyDynamicRoute = require(__base + 'routes/enterprise/companyDynamic');
  const enterpriseCompanyAwardRoute = require(__base + 'routes/enterprise/companyAward');
  const enterpriseCompanyWelfareRoute = require(__base + 'routes/enterprise/companyWelfare');
  const enterpriseCompanyFileRoute = require(__base + 'routes/enterprise/companyFile');
  const enterpriseAuthRoute = require(__base + 'routes/enterprise/auth');
  const enterpriseEnterpriseRoute = require(__base + 'routes/enterprise/enterprise');
  const enterpriseCreditRoute = require(__base + 'routes/enterprise/credit');
  const enterpriseInvoiceRoute = require(__base + 'routes/enterprise/invoice');
  const enterpriseCardRoute = require(__base + 'routes/enterprise/card');
  const billsRoute = require(__base + 'routes/enterprise/billing');
  const enterpriseChatRoute = require(__base + 'routes/enterprise/chat');

  app.use(apiEnterprisePath + '/activate', jwtMiddleware.jwt, jwtMiddleware.checkProvider, enterpriseAuthRoute.activate);
  app.use(apiEnterprisePath + '/is_activated', jwtMiddleware.jwt, jwtMiddleware.checkProvider, enterpriseAuthRoute.isActivated);
  app.use(apiEnterprisePath + '/*', jwtMiddleware.jwt, jwtMiddleware.checkProvider, enterpriseJwtAuthMiddleware);


  // app.use(apiEnterprisePath + '/activate', jwtMiddleware, enterpriseAuthRoute.activate);
  // app.use(apiEnterprisePath + '/is_activated', jwtMiddleware, enterpriseAuthRoute.isActivated);
  // app.use(apiEnterprisePath + '/*', jwtMiddleware, enterpriseJwtAuthMiddleware);

  app.get(`${apiEnterprisePath}/enterprises/self`, enterpriseEnterpriseRoute.show);
  app.put(`${apiEnterprisePath}/enterprises/self`, enterpriseEnterpriseRoute.update);

  /**
   * chat
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/chat/login`, enterpriseChatRoute.login);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/chat`, enterpriseChatRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/chat/:userId([0-9]+)`, enterpriseChatRoute.show);
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/chat/:userId([0-9]+)`, enterpriseChatRoute.create);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/chat/:userId([0-9]+)`, enterpriseChatRoute.update);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/chat/:userId([0-9]+)`, enterpriseChatRoute.destroy);

  // 购买计划
  app.post(`${apiEnterprisePath}/plans`, enterpriseEnterpriseRoute.buyPlan);
  app.post(`${apiEnterprisePath}/positionQuotas`, enterpriseEnterpriseRoute.buyPositionQuota);
  // 充值
  app.post(`${apiEnterprisePath}/deposit`, enterpriseCreditRoute.deposit);

  /**
   * 付款纪录
   */
  app.get(`${apiEnterprisePath}/invoices`, enterpriseInvoiceRoute.index);
  app.get(`${apiEnterprisePath}/invoices/:invoiceId`, enterpriseInvoiceRoute.show);

  /**
   * 信用卡
   */
  app.get(`${apiEnterprisePath}/cards`, enterpriseCardRoute.index);
  app.get(`${apiEnterprisePath}/cards/:cardId`, enterpriseCardRoute.show);
  app.post(`${apiEnterprisePath}/cards`, enterpriseCardRoute.create);
  // 设定默认付款方法
  app.post(`${apiEnterprisePath}/cards/:cardId/default`, enterpriseCardRoute.setDefault);
  app.delete(`${apiEnterprisePath}/cards/:cardId`, enterpriseCardRoute.destroy);

  /**
   * 公司
   */
  app.get(`${apiEnterprisePath}/companies`, enterpriseCompanyRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)`, enterpriseCompanyRoute.show);
  app.post(`${apiEnterprisePath}/companies`, enterpriseCompanyRoute.create);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)`, enterpriseCompanyRoute.update);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)`, enterpriseCompanyRoute.destroy);

  /**
   * 公司動態
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyDynamics`, enterpriseCompanyDynamicRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyDynamics/:companyDynamicId([0-9]+)`, enterpriseCompanyDynamicRoute.show);
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyDynamics`, enterpriseCompanyDynamicRoute.create);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyDynamics/:companyDynamicId([0-9]+)`, enterpriseCompanyDynamicRoute.destroy);

  /**
   * 公司獎項
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyAwards`, enterpriseCompanyAwardRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyAwards/:companyAwardId([0-9]+)`, enterpriseCompanyAwardRoute.show);
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyAwards`, enterpriseCompanyAwardRoute.create);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyAwards/:companyAwardId([0-9]+)`, enterpriseCompanyAwardRoute.destroy);

  /**
   * 公司福利
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyWelfares`, enterpriseCompanyWelfareRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyWelfares/:companyWelfareId([0-9]+)`, enterpriseCompanyWelfareRoute.show);
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyWelfares`, enterpriseCompanyWelfareRoute.create);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyWelfares/:companyWelfareId([0-9]+)`, enterpriseCompanyWelfareRoute.destroy);

  /**
   * 统计图
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/chart`, enterpriseCompanyRoute.candidateChart);
  app.get(`${apiEnterprisePath}/positions/:positionId([0-9]+)/chart`, enterprisePositionRoute.candidateChart);

  /**
   * 职位
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions`, enterprisePositionRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions/:positionId([0-9]+)`, enterprisePositionRoute.show);
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions`, enterprisePositionRoute.create);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions/:positionId([0-9]+)/renew`, enterprisePositionRoute.renew);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions/:positionId([0-9]+)`, enterprisePositionRoute.update);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions/:positionId([0-9]+)`, enterprisePositionRoute.destroy);

  /**
   * 职位附加提问
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions/:positionId([0-9]+)/questions`, enterprisePositionQuestionRoute.show);
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions/:positionId([0-9]+)/questions`, enterprisePositionQuestionRoute.create);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions/:positionId([0-9]+)/questions/:questionId([0-9]+)`, enterprisePositionQuestionRoute.update);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/positions/:positionId([0-9]+)/questions/:questionId([0-9]+)`, enterprisePositionQuestionRoute.destroy);

  /**
   * 公司头像 与 图片
   */
  // 上传头像
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/icon`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), enterpriseCompanyPictureRoute.uploadIcon);

  // 上传公司图片
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/pictures`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), enterpriseCompanyPictureRoute.uploadPicture);

  // 上传公司封面图
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/cover`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), enterpriseCompanyPictureRoute.uploadCover);

  // 上传公司動態图片
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyDynamics/:companyDynamicId([0-9]+)/pictures`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), enterpriseCompanyDynamicPictureRoute.uploadPicture);

  // 上传公司文件
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/files`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), enterpriseCompanyFileRoute.uploadFiles);

  /**
   * 公司圖片
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/pictures`, enterpriseCompanyPictureRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/pictures/:pictureId([0-9]+)`, enterpriseCompanyPictureRoute.show);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/pictures/:pictureId([0-9]+)`, enterpriseCompanyPictureRoute.destroy);

  /**
   * 公司動態圖片
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyDynamics/:companyDynamicId([0-9]+)/pictures`, enterpriseCompanyDynamicPictureRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyDynamics/:companyDynamicId([0-9]+)/pictures/:pictureId([0-9]+)`, enterpriseCompanyDynamicPictureRoute.show);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/companyDynamics/:companyDynamicId([0-9]+)/pictures/:pictureId([0-9]+)`, enterpriseCompanyDynamicPictureRoute.destroy);

  /**
   * 公司文件
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/files`, enterpriseCompanyFileRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/files/:fileId([0-9]+)`, enterpriseCompanyFileRoute.show);
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/video`, enterpriseCompanyFileRoute.create);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/files/:fileId([0-9]+)`, enterpriseCompanyFileRoute.destroy);

  /**
   * 面试者
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/candidates`, enterpriseCompanyCandidateRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/candidates/:candidateId([0-9]+)`, enterpriseCompanyCandidateRoute.show);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/candidates/:candidateId([0-9]+)`, enterpriseCompanyCandidateRoute.update);

  /**
   * 面试者评论
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/reviews`, enterpriseCompanyReviewRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/reviews/:reviewId([0-9]+)`, enterpriseCompanyReviewRoute.show);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/reviews/:reviewId([0-9]+)`, enterpriseCompanyReviewRoute.update);

  /**
   * 添加员工进入公司
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/userCompanies`, enterpriseUserCompanyRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/userCompanies/:userCompanyId([0-9]+)`, enterpriseUserCompanyRoute.show);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/userCompanies/:userCompanyId([0-9]+)`, enterpriseUserCompanyRoute.update);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/userCompanies/:userCompanyId([0-9]+)`, enterpriseUserCompanyRoute.destroy);

  /**
   * 职位邀请任务
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/position_invitation_jobs`, enterprisePositionInvitationJobRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/position_invitation_jobs/:positionInvitationJobId`, enterprisePositionInvitationJobRoute.show);
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/position_invitation_jobs`, enterprisePositionInvitationJobRoute.create);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/position_invitation_jobs/:positionInvitationJobId`, enterprisePositionInvitationJobRoute.update);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/position_invitation_jobs/:positionInvitationJobId`, enterprisePositionInvitationJobRoute.destroy);

  // 人均单价 实时显示路由
  app.post(`${apiEnterprisePath}/position_invitation_jobs`, positionInvitationJobRoute.filter, enterprisePositionInvitationJobRoute.perCapitaCost);
  // invitation position person num.
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/position_invitation_jobs/:positionInvitationJobId/persons`, enterprisePositionInvitationJobRoute.byInvitationPositionJobsPersonCount);

  /**
   * 文章
   */
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/posts`, enterprisePostRoute.index);
  app.get(`${apiEnterprisePath}/companies/:companyId([0-9]+)/posts/:postId([0-9]+)`, enterprisePostRoute.show);
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/posts`, enterprisePostRoute.create);
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/posts/:postId([0-9]+)`, enterprisePostRoute.update);
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/posts/:postId([0-9]+)`, enterprisePostRoute.destroy);

  /**
   * post 上下线
   */
  app.put(`${apiEnterprisePath}/companies/:companyId([0-9]+)/posts/:postId([0-9]+)/modify_active`, enterprisePostRoute.modifyActive);

  // 上传文章封面
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/posts/:postId([0-9]+)/cover`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), enterprisePostImageRoute.uploadCover);
  // 上传文章圖片
  app.post(`${apiEnterprisePath}/companies/:companyId([0-9]+)/posts/:postId([0-9]+)/images`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), enterprisePostImageRoute.uploadImage);
  // 删除文章封面
  app.delete(`${apiEnterprisePath}/companies/:companyId([0-9]+)/posts/:postId([0-9]+)/images/:imageId([0-9]+)`, enterprisePostImageRoute.destroy);

  /**
   * 文章图片
   */
  app.post(`${apiEnterprisePath}/upload_images`, app.multipartForm.fields([{
    name: 'file',
    maxCount: 1
  }]), staticImageRoute.uploadImage);

  /**
   * Bills
   */
  app.get(`${apiEnterprisePath}/bills`, billsRoute.index);
  app.get(`${apiEnterprisePath}/bills/:billId([0-9]+)`, billsRoute.show);
  app.post(`${apiEnterprisePath}/bills`, billsRoute.create);
  app.put(`${apiEnterprisePath}/bills/:billId([0-9]+)`, billsRoute.update);
  app.delete(`${apiEnterprisePath}/bills/:billId([0-9]+)`, billsRoute.destroy);

};


