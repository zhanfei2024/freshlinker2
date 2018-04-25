import {NgModule} from "@angular/core";
import {SharedModule} from "../../common/shared/shared.module";
import {UpgradeCompanyRoutingModule} from "./upgrade_company-routing.module";
import {UpgradeCompanyComponent} from "./upgrade_company.component";
import {UpgradeCompanyProfileComponent} from "./profile/upgrade_company_profile.component";
import {UpgradeCompanyService} from "./upgrade_campany_service";
import {CarouselModule} from 'primeng/primeng';
import {PaginationModule} from "ngx-bootstrap";
import {NgxGalleryModule} from "ngx-gallery/lib/ngx-gallery.module";
import { QuillEditorModule } from 'ngx-quill-editor';
import {CompanyService} from "app/company/service/company.service";
import {EnterpriseHttpService} from "../../common/http/enterprise.http.service";
import {WelfareAwardsService} from "../company/service/welfare-awards.service";
import {UserService} from "../user/user.service";
import {UserPostService} from "../user/user_article/user_article.service";


@NgModule({
  imports: [
    UpgradeCompanyRoutingModule,
    SharedModule,
    PaginationModule,
    NgxGalleryModule,
    QuillEditorModule,
    CarouselModule
  ],
  declarations: [
    UpgradeCompanyComponent,
    UpgradeCompanyProfileComponent,
  ],
  providers: [
    UpgradeCompanyService,
    CompanyService,
    EnterpriseHttpService,
    WelfareAwardsService,
    UserService,
    UserPostService
  ]
})

export class UpgradeCompanyModule {

}
