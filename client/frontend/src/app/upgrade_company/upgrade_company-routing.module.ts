import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {FullLayoutComponent} from "../../common/layouts/full-layout.component";
import {UpgradeCompanyComponent} from "./upgrade_company.component";
import {UpgradeCompanyProfileComponent} from "./profile/upgrade_company_profile.component";

const routes: Routes = [
  {

        path: '',
        component: UpgradeCompanyComponent,
        children: [
          {
            path: ':id/profile',
            component: UpgradeCompanyProfileComponent
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

export class UpgradeCompanyRoutingModule {

}
