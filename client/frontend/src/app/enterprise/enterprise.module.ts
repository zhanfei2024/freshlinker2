import {NgModule} from "@angular/core";
import {EnterpriseRoutingModule} from "./enterprise-routing.module";
import {SharedModule} from "../../common/shared/shared.module";
import {EnterpriseShowComponent} from "./enterprise-show/enterprise-show.component";
import {EnterpriseCompanyPageComponent} from "./enterprise_company_page_show/enterprise_company_page_show";
import {EnterpriseComponent} from "./enterprise.component";
import {EnterpriseDashboardComponent} from "./enterprise_dashboard_show/enterprise_dashboard_show";
import {EnterpriseService} from "./enterprise.service";



@NgModule({
    imports: [
        EnterpriseRoutingModule,
        SharedModule
    ],
    declarations: [
      EnterpriseComponent,
      EnterpriseShowComponent,
      EnterpriseCompanyPageComponent,
      EnterpriseDashboardComponent
    ],
    providers: [
      EnterpriseService
    ]
})

export class EnterpriseModule {

}
