import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {UserComponent} from './user.component';
import {LoginCheckResolve} from "../auth/login-check-resolve.service";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ProfileComponent} from "./profile/profile.component";
import {UserAppliedPositionComponent} from "./user-applied-position/user.applied.position";
import {BookmarkComponent} from "./bookmark/bookmark.component";
import {UserResumeComponent} from "./user-resume/user-resume.component";
import {JobInviteComponent} from "./job_invite/job_invite.component";
import {UserArticleComponent} from "./user_article/user_article_list/user_article_list.component";
import {UserActivityComponent} from "./user_activity/user_activity_list/user_activity_list.component";
import {UserQaComponent} from "./user_qa/user_qa_list/user_qa_list.component";
import {UserArticlePreviewComponent} from "./user-post-preview/user.post.preview.component";
import {UserArticleEditComponent} from "./user_article/user_article_edit/user_article_edit.component";
import {PostFindResolve} from "./user_article/post-resolve-service";
import {UserActivityEditComponent} from "./user_activity/user_activity_edit/user_activity_edit.component";
import {UserQaEditComponent} from "./user_qa/user_qa_edit/user_qa_edit.component";
import {UserInformationComponent} from "./user-information/user-information.component";
import {ProfileExperienceFormComponent} from "./profile.experience.form/profile.experience.form.component";
import {ProfileEducationFormComponent} from "./profile.education.form/profile.education.form.component";
import {ProfileExpectJobsFormComponent} from "./profile.expectJobs.form/profile.expectJobs.form.component";
import {ProfileLanguageComponent} from "./profile.language.form/profile.language.component";
import {UserNewsCenterComponent} from './user-news-center/user-news-center.component';

const routes: Routes = [{
  path: '',
  component: UserComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'user-news',
      component: UserNewsCenterComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: ':id/user-news',
      component: UserNewsCenterComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'profile',
      component: ProfileComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'user-positions',
      component: UserAppliedPositionComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'bookmark',
      component: BookmarkComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'user-resume',
      component: UserResumeComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: ':id/user-resume',
      component: UserResumeComponent,
    },
    {
      path: 'job-invite',
      component: JobInviteComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'article',
      component: UserArticleComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'activity',
      component: UserActivityComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'qa',
      component: UserQaComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'article/:id/preview',
      component: UserArticlePreviewComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'activity/:id/preview',
      component: UserArticlePreviewComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'qa/:id/preview',
      component: UserArticlePreviewComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'article/edit',
      component: UserArticleEditComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'article/:id/edit',
      component: UserArticleEditComponent,
      resolve: {
        articleFindResolve: PostFindResolve,
        isLogin: LoginCheckResolve,
      },

    },
    {
      path: 'activity/edit',
      component: UserActivityEditComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'activity/:id/edit',
      component: UserActivityEditComponent,
      resolve: {
        activityFindResolve: PostFindResolve,
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'qa/edit',
      component: UserQaEditComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'qa/:id/edit',
      component: UserQaEditComponent,
      resolve: {
        qaFindResolve: PostFindResolve,
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'user-information',
      component: UserInformationComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'experience/edit',
      component: ProfileExperienceFormComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'experience/:id/edit',
      component: ProfileExperienceFormComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'education/edit',
      component: ProfileEducationFormComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    }, {
      path: 'education/:id/edit',
      component: ProfileEducationFormComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'expectJobs/edit',
      component: ProfileExpectJobsFormComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    }, {
      path: 'expectJobs/:id/edit',
      component: ProfileExpectJobsFormComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    },
    {
      path: 'language/edit',
      component: ProfileLanguageComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    }, {
      path: 'language/:id/edit',
      component: ProfileLanguageComponent,
      resolve: {
        isLogin: LoginCheckResolve,
      },
    }

  ]
}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class UserRoutingModule {

}
