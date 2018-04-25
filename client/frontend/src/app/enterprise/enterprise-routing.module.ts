import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {EnterpriseComponent} from "./enterprise.component";
import {EnterpriseShowComponent} from "./enterprise-show/enterprise-show.component";
import {EnterpriseCompanyPageComponent} from "./enterprise_company_page_show/enterprise_company_page_show";
import {EnterpriseDashboardComponent} from "./enterprise_dashboard_show/enterprise_dashboard_show";
import {SimpleLayoutComponent} from "../../common/layouts/simple-layout.component";


const routes: Routes = [

      {
        path: '',
        component: EnterpriseComponent,
        children: [
          {
            path : "enterprise_show",
            component: EnterpriseShowComponent
          },
          {
            path : "company_page_show",
            component: EnterpriseCompanyPageComponent
          },
          {
            path : "dashboard_show",
            component: EnterpriseDashboardComponent
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

export class EnterpriseRoutingModule {

}
