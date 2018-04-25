import {NgModule} from '@angular/core';
import {UserComponent} from './user.component';
import {UserService} from "./user.service";
import {UserRoutingModule} from './user-routing.module';
import {FormsModule} from '@angular/forms';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {UserTabsComponent} from "./user-tabs/user-tabs.component";
import {SharedModule} from "../../common/shared/shared.module";
import {ProfileComponent} from "./profile/profile.component";
import {UserAppliedPositionComponent} from "./user-applied-position/user.applied.position";
import {BookmarkComponent} from "./bookmark/bookmark.component";
import {UserResumeComponent} from "./user-resume/user-resume.component";
import {JobInviteComponent} from "./job_invite/job_invite.component";
import {UserActivityComponent} from "./user_activity/user_activity_list/user_activity_list.component";
import {UserArticleComponent} from "./user_article/user_article_list/user_article_list.component";
import {UserQaComponent} from "./user_qa/user_qa_list/user_qa_list.component";
import {UserPostService} from "./user_article/user_article.service";
import {UserArticlePreviewComponent} from "./user-post-preview/user.post.preview.component";
import {UserArticleEditComponent} from "./user_article/user_article_edit/user_article_edit.component";
import {UserActivityEditComponent} from "./user_activity/user_activity_edit/user_activity_edit.component";
import {UserQaEditComponent} from "./user_qa/user_qa_edit/user_qa_edit.component";
import {UserInformationComponent} from "./user-information/user-information.component";
import {CountryService} from "./country.service";
import {LocationService} from "../../common/service/location.service";
import {UserExperienceService} from "./profile.experience.form/profile.experience.service";
import {UserExpectService} from "./profile.expectJobs.form/profile.expectJobs.service";
import {ProfileExpectJobsFormComponent} from "./profile.expectJobs.form/profile.expectJobs.form.component";
import {ProfileExperienceFormComponent} from "./profile.experience.form/profile.experience.form.component";
import {UserEducationService} from "./profile.education.form/profile.education.service";
import {ProfileEducationFormComponent} from "./profile.education.form/profile.education.form.component";
import {ProfileLanguageComponent} from "./profile.language.form/profile.language.component";
import {UserLanguageService} from "./profile.language.form/profile.language.service";
import { SliderModule} from 'primeng/primeng';
import {CanUserDeactivate} from './user-deactivate'
import {ImgFileUploaderService} from "../../common/global/img-file-uploader";
import {ComponentLoaderFactory, ModalModule, PaginationModule, PositioningService} from "ngx-bootstrap";
import {FileUploadModule} from "ng2-file-upload";
import {SelectModule} from "ng2-select";
import {QuillEditorModule } from 'ngx-quill-editor';
import {ImageCropperModule} from "ng2-img-cropper";
import {NgxMyDatePickerModule} from "ngx-mydatepicker";
import {LoginCheckResolve} from "../auth/login-check-resolve.service";
import {PostFindResolve} from "./user_article/post-resolve-service";
import {IToasterModule} from "../../common/iToaster/iToaster.module";
import {UserNewsCenterComponent} from "./user-news-center/user-news-center.component";
import {BsDropdownModule} from "ngx-bootstrap";

@NgModule({
  imports: [
    UserRoutingModule,
    FormsModule,
    SharedModule,
    SliderModule,
    ModalModule,
    FileUploadModule,
    SelectModule,
    PaginationModule,
    QuillEditorModule,
    ImageCropperModule,
    IToasterModule,
    NgxMyDatePickerModule,
    BsDropdownModule.forRoot(),
  ],
  declarations: [
    UserComponent,
    DashboardComponent,
    UserTabsComponent,
    ProfileComponent,
    UserAppliedPositionComponent,
    BookmarkComponent,
    UserResumeComponent,
    JobInviteComponent,
    UserActivityComponent,
    UserArticleComponent,
    UserQaComponent,
    UserArticlePreviewComponent,
    UserArticleEditComponent,
    UserActivityEditComponent,
    UserQaEditComponent,
    UserInformationComponent,
    ProfileExpectJobsFormComponent,
    ProfileEducationFormComponent,
    ProfileExperienceFormComponent,
    ProfileLanguageComponent,
    UserNewsCenterComponent,
  ],
  providers: [
    UserService,
    UserPostService,
    CountryService,
    UserExpectService,
    UserExperienceService,
    LocationService,
    UserEducationService,
    UserLanguageService,
    CanUserDeactivate,
    ImgFileUploaderService,
    ComponentLoaderFactory,
    PositioningService,
    LoginCheckResolve,
    PostFindResolve,
  ]


})
export class UserModule {
}
