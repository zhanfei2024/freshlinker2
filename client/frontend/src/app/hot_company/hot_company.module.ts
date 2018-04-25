import {NgModule} from '@angular/core';
import {SharedModule} from '../../common/shared/shared.module';
import {HotCompanyComponent} from './hot_company.component';
import {HotCompanyRoutingModule} from './hot_company-routing.module';
import {HotCompanyService} from './hot_company.service';
import {SearchModule} from '../search/search.module';
import {PaginationModule} from "ngx-bootstrap";


@NgModule({
  imports: [
    HotCompanyRoutingModule,
    PaginationModule,
    SearchModule,
    SharedModule
  ],
  declarations: [
    HotCompanyComponent
  ],
  providers: [
    HotCompanyService
  ]
})

export class HotCompanyModule {

}
