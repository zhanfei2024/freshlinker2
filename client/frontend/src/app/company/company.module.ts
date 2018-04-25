import {NgModule} from '@angular/core';
import {SharedModule} from "../../common/shared/shared.module";

import {CompanyRoutingModule} from "./company-routing-module";
import {CompanyService} from "./service/company.service";
import {CompanyComponent} from "./company.component";
import {CompanyFormComponent} from "./company-form/company-form.component";
import {PromptListComponent} from "./prompt-list/prompt-list.component";
import {CompanyListComponent} from "./company-list/company-list.component";
import {CompanyInterviewComponent} from "./company-interview/company-interview.component";
import {CandidatePositionService} from "./service/company-interview.serivce";
import {CompanyPositionService} from "./service/company-position.service";
import {CompanyPositionComponent} from "./position-list/company-position.component";
import {PositionFormComponent} from "./position-form/position-form.component";
import {CompanyEmployeeComponent} from "./employee-list/company-employee.component";
import {CompanyEmployeeService} from "./service/company.employee.service";
import {JobOfferService} from "./service/company_job_offer.service";
import {JobOfferListComponent} from "./job-offer/job-offer-list/job-offer-list.component";
import {JobOfferFormComponent} from "./job-offer/job-offer-form/job-offer-form.component";
import {LanguageService} from "../../common/service/language.service";
import {EducationLevelService} from "../../common/service/education_level.service";
import {CompanyPlanPackageService} from "./service/plan_package.service";
import {PricingComponent} from "./pricing/pricing.component";
import {PlanPackageDetailComponent} from "./plan_package/plan_package_detail/plan_package_detail.component";
import {CreditService} from "./service/credit.service";
import {WelfareAwardsComponent} from "./welfare-awards/welfare-awards-list/welfare-awards.component";
import {WelfareAwardsService} from "./service/welfare-awards.service";
import {CompanyPictureComponent} from "./company-picture/company_picture.component";
import {CreditCardComponent} from "./credit_card/credit_card.component";
import {RechargeComponent} from "./recharge/recharge.component";
import {RechargeConfirmComponent} from "./recharge_confirm/recharge_confirm.component";
import {AccountComponent} from "./account/account.component";
import {ConsumeComponent} from "./consume/consume.component";
import {CarouselModule} from 'primeng/primeng';
import {DashboardLeftComponent} from "./company-dashboard/dashboard-left/dashboard-left.component";
import {SelectCompanyComponent} from "./company-dashboard/select.company/select.company.component";
import {CompanyDashboardComponent} from "./company-dashboard/dashboard/dashboard.component";
import {DashboardService} from "./company-dashboard/company-dashboard.service";
import {JobOfferIntroduceComponent} from "./job-offer/job_offer_introduce/job_offer_introduce.component";
import {CompanyDeactivate} from './company-deactivate';
import {
  BsDropdownModule, BsModalService, ComponentLoaderFactory, ModalModule, PaginationModule,
  PositioningService
} from "ngx-bootstrap";
import {SelectModule} from "ng2-select";
import {ImageCropperModule} from "ng2-img-cropper";
import { QuillEditorModule } from 'ngx-quill-editor';
import {NgxMyDatePickerModule} from "ngx-mydatepicker";
import {NgxGalleryModule} from "ngx-gallery/lib/ngx-gallery.module";
import {ChartsModule} from "ng2-charts";
import {FileUploadModule} from "ng2-file-upload";
import {CompanyLoginCheckResolve} from "../auth/login-company-check-resolve.service";
import {EnterpriseHttpService} from "../../common/http/enterprise.http.service";
import {UserService} from "../user/user.service";
import {Auth} from "../auth/auth.service";
import {AuthConfig} from "../../common/config/auth.config";
import {CountryService} from "../user/country.service";
import {ImgFileUploaderService} from "../../common/global/img-file-uploader";
import {PositionFormFindResolve} from "./position-form-resolve.service";
import {DashboardFindResolve} from "./company-dashboard/dashboard-resolve.service";
import {UpgradeCompanyService} from "../upgrade_company/upgrade_campany_service";
import {DashboardTabsComponent} from "../../common/dashboard-tabs/dashboard-tabs.component";
import {PositionQuestionService} from "../position/position.question.service";
import {CompanyChatComponent} from "../../common/chat/companyChat/companyChat.component";
import {IToasterModule} from "../../common/iToaster/iToaster.module";
import {EnterpriseService} from "../enterprise/enterprise.service";
import {DateComponent} from "./welfare-awards/welfare-awards-list/date/date.component";
import {COmpanyNewsCenterComponent} from "./company-news-center/company-news-center.component";

@NgModule({
  imports: [
    CompanyRoutingModule,
    SelectModule,
    SharedModule,
    CarouselModule,
    ImageCropperModule,
    QuillEditorModule,
    NgxGalleryModule,
    ChartsModule,
    ModalModule,
    BsDropdownModule,
    PaginationModule,
    FileUploadModule,
    IToasterModule,
    NgxMyDatePickerModule,
    BsDropdownModule.forRoot()
  ],
  providers: [
    CompanyService,
    Auth,
    AuthConfig,
    CandidatePositionService,
    CompanyPositionService,
    CompanyEmployeeService,
    JobOfferService,
    LanguageService,
    EducationLevelService,
    CompanyPlanPackageService,
    CreditService,
    WelfareAwardsService,
    DashboardService,
    ImgFileUploaderService,
    CountryService,
    BsModalService,
    CompanyDeactivate,
    CompanyLoginCheckResolve,
    EnterpriseHttpService,
    PositioningService,
    UserService,
    PositionFormFindResolve,
    DashboardFindResolve,
    UpgradeCompanyService,
    PositionQuestionService,
    EnterpriseService,
    ComponentLoaderFactory
  ],
  declarations: [
    CompanyComponent,
    CompanyFormComponent,
    PromptListComponent,
    CompanyListComponent,
    CompanyInterviewComponent,
    CompanyPositionComponent,
    PositionFormComponent,
    CompanyEmployeeComponent,
    JobOfferListComponent,
    JobOfferFormComponent,
    PricingComponent,
    PlanPackageDetailComponent,
    WelfareAwardsComponent,
    CompanyPictureComponent,
    CreditCardComponent,
    RechargeComponent,
    RechargeConfirmComponent,
    AccountComponent,
    ConsumeComponent,
    CompanyDashboardComponent,
    DashboardLeftComponent,
    SelectCompanyComponent,
    JobOfferIntroduceComponent,
    DashboardTabsComponent,
    CompanyChatComponent,
    COmpanyNewsCenterComponent,
    DateComponent
  ]
})
export class CompanyModule {
}
