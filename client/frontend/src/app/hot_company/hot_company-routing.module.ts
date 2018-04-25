import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {HotCompanyComponent} from "./hot_company.component";

const routes: Routes = [
     {
        path: '',
        component: HotCompanyComponent,
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

export class HotCompanyRoutingModule {

}
