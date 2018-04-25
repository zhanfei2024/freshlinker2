import {NgModule} from '@angular/core';
import {RouterModule, Routes, PreloadAllModules} from '@angular/router';
import {FullLayoutComponent} from '../common/layouts/full-layout.component';
import {SimpleLayoutComponent} from '../common/layouts/simple-layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: '',
    component: FullLayoutComponent,
    children: [
      {path: '', loadChildren: 'app/home/home.module#HomeModule'},
      {path: 'position_category', loadChildren: 'app/position_category/position_category.module#PositionCategoryModule'},
      {path: 'about', loadChildren: 'app/about/about.module#AboutModule'},
      {path: 'hot_company', loadChildren: 'app/hot_company/hot_company.module#HotCompanyModule'},
      {path: 'upgrade_company', loadChildren: 'app/upgrade_company/upgrade_company.module#UpgradeCompanyModule'},
      {path: 'position-list', loadChildren: 'app/position/position.module#PositionModule'},
      {path: 'position-list/:code', loadChildren: 'app/position/position.module#PositionModule'},
      {path: 'search-position', loadChildren: 'app/position/position.module#PositionModule'},
      {path: 'company-position/:id/position', loadChildren: 'app/position/position.module#PositionModule'},
      {path: 'positions/:id', loadChildren: 'app/position/position-show/position-show.module#PositionShowModule'},
      {path: 'articles/:id', loadChildren: 'app/post/article-show/article-show.module#ArticleShowModule'},
      {path: 'activity/:id', loadChildren: 'app/post/activity-show/activity-show.module#ActivityShowModule'},
      {path: 'interlocution/:id', loadChildren: 'app/post/interlocution-show/interlocution-show.module#InterlocutionShowModule'},
      {path: 'article-list/:id', loadChildren: 'app/post/post-list/post-list.module#PostListModule'},
      {path: 'activity-list/:id', loadChildren: 'app/post/post-list/post-list.module#PostListModule'},
      {path: 'qa-list/:id', loadChildren: 'app/post/post-list/post-list.module#PostListModule'},
      {path: 'search-article', loadChildren: 'app/post/search-article/search-article.module#SearchArticleModule'},
      {path: 'user', loadChildren: 'app/user/user.module#UserModule'},
    ]
  },

  {path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule'},
  {
    path: '',
    component: SimpleLayoutComponent,
    children: [
      {path: 'enterprise', loadChildren: 'app/enterprise/enterprise.module#EnterpriseModule'},
      {path: 'company', loadChildren: 'app/company/company.module#CompanyModule'},

    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // useHash: true,
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [
    RouterModule
  ],
  providers: []
})
export class AppRoutingModule {
}
