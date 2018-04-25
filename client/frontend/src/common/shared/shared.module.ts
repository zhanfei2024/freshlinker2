import {NgModule, Directive}            from '@angular/core';
import {CommonModule}        from '@angular/common';
import {FormsModule, ReactiveFormsModule}         from '@angular/forms';
import {FormMessageModule} from "../control-message/index";
import {PipeModule} from "../pipe/index";
import {IToasterModule} from "../iToaster/iToaster.module";
import {RouterModule} from "@angular/router";
import {BreadcrumbModule} from "../breadcrumb/breadcrumb.module";
import {EnterpriseNavbarComponent} from "../enterprise-navbar/enterprise-navbar.component"
import {Ng2PageScrollModule} from "ng2-page-scroll";
import {TranslateModule} from "@ngx-translate/core";
import {AccordionModule, CarouselModule, CollapseModule, TabsModule} from "ngx-bootstrap";
import {Auth} from "../../app/auth/auth.service";
import {ToasterService} from "angular2-toaster";
import {UserService} from '../../app/user/user.service';
import {LanguageService} from '../service/language.service';
import {JSONValidator} from "ng2-validation/dist/json";
import {NumberValidator} from "ng2-validation/dist/number";

export const SHARED_MODULE_DIRECTIVES: Directive[] = [
  // core
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  TranslateModule,
  CollapseModule,
  AccordionModule,
  CarouselModule,
  TabsModule,
  Ng2PageScrollModule,
  // UI plugin
  IToasterModule,
  BreadcrumbModule,
  // other
  FormMessageModule,
  PipeModule,
];

@NgModule({
  imports: [SHARED_MODULE_DIRECTIVES],
  exports: [SHARED_MODULE_DIRECTIVES],
  declarations: [
    JSONValidator,
    NumberValidator,
  ], providers: [
    Auth,
    ToasterService,
    UserService,
    LanguageService,
  ]
})
export class SharedModule {
}
