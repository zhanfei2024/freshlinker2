import {NgModule}     from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CompanyComponent} from "./company.component";
import {CompanyFormComponent} from "./company-form/company-form.component";
import {PromptListComponent} from "./prompt-list/prompt-list.component";
import {CompanyListComponent} from "./company-list/company-list.component";
import {CompanyInterviewComponent} from "./company-interview/company-interview.component";
import {CompanyPositionComponent} from "./position-list/company-position.component";
import {PositionFormComponent} from "./position-form/position-form.component";
import {PositionFormFindResolve} from "./position-form-resolve.service";
import {CompanyEmployeeComponent} from "./employee-list/company-employee.component";
import {JobOfferListComponent} from "./job-offer/job-offer-list/job-offer-list.component";
import {JobOfferFormComponent} from "./job-offer/job-offer-form/job-offer-form.component";
import {PricingComponent} from "./pricing/pricing.component";
import {PlanPackageDetailComponent} from "./plan_package/plan_package_detail/plan_package_detail.component";
import {WelfareAwardsComponent} from "./welfare-awards/welfare-awards-list/welfare-awards.component";
import {CompanyPictureComponent} from "./company-picture/company_picture.component";
import {CreditCardComponent} from "./credit_card/credit_card.component";
import {RechargeComponent} from "./recharge/recharge.component";
import {RechargeConfirmComponent} from "./recharge_confirm/recharge_confirm.component";
import {AccountComponent} from "./account/account.component";
import {ConsumeComponent} from "./consume/consume.component";
import {CompanyLoginCheckResolve} from "../auth/login-company-check-resolve.service";
import {SelectCompanyComponent} from "./company-dashboard/select.company/select.company.component";
import {DashboardFindResolve} from "./company-dashboard/dashboard-resolve.service";
import {CompanyDashboardComponent} from "./company-dashboard/dashboard/dashboard.component";
import {JobOfferIntroduceComponent} from "./job-offer/job_offer_introduce/job_offer_introduce.component";
import {CompanyDeactivate} from './company-deactivate';
import {COmpanyNewsCenterComponent} from "./company-news-center/company-news-center.component";

const routes: Routes = [

  {
        path: '',
        component: CompanyComponent,
        children: [
          {
            path: 'company-edit',
            component: CompanyFormComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/company-edit',
            component: CompanyFormComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          }, {
            path: ':id/prompt',
            component: PromptListComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/company-list',
            component: CompanyListComponent,
          },
          {
            path: ':id/interview',
            component: CompanyInterviewComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/position-list',
            component: CompanyPositionComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/positions_create',
            component: PositionFormComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':companyId/:positionId/positions_create',
            component: PositionFormComponent,
            resolve: {
              positionFormFindResolveL: PositionFormFindResolve,
              isLogin: CompanyLoginCheckResolve

            }
          },
          {
            path: ':id/employee-list',
            component: CompanyEmployeeComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/job-offer-list',
            component: JobOfferListComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/job-offer',
            component: JobOfferFormComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/job_offer_introduce',
            component: JobOfferIntroduceComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/:jobId/job-offer-edit',
            component: JobOfferFormComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: 'pricing',
            component: PricingComponent,
          },
          {
            path: 'pricing/upgradePage',
            component: PricingComponent,
          },
          {
            path: 'plan_package_detail/:id',
            component: PlanPackageDetailComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: 'plan_position_detail/:id',
            component: PlanPackageDetailComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/welfare-awards/:id',
            component: WelfareAwardsComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/pictures',
            component: CompanyPictureComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },

          {
            path: ':id/credit_card',
            component: CreditCardComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/recharge',
            component: RechargeComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          }, {
            path: ':id/recharge-confirm',
            component: RechargeConfirmComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          }, {
            path: ':id/account',
            component: AccountComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          }, {
            path: ':id/consume',
            component: ConsumeComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            },
          },
          {
            path: ':id/dashboard',
            component: CompanyDashboardComponent,
            resolve: {
              dashboardFindResolve: DashboardFindResolve,
              isLogin: CompanyLoginCheckResolve
            }
          },
          {
            path: 'select',
            component: SelectCompanyComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            }
          },{
            path: ':id/news',
            component: COmpanyNewsCenterComponent,
            resolve: {
              isLogin: CompanyLoginCheckResolve
            }
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
  ],

})
export class CompanyRoutingModule {
}
