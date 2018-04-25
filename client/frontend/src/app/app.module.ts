import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {FullLayoutComponent} from '../common/layouts/full-layout.component';
import {SimpleLayoutComponent} from '../common/layouts/simple-layout.component';
import {FooterComponent} from '../common/footer/footer.component';
import {JobSeekerNavbarComponent} from '../common/job-seeker-navbar/job-seeker-navbar.component';
import {Http, HttpModule} from '@angular/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {Ng2PageScrollModule} from 'ng2-page-scroll';
import {AccordionConfig, AccordionModule, CollapseModule, PaginationConfig, TabsetConfig} from 'ngx-bootstrap';
import {Auth} from './auth/auth.service';
import {Config} from '../common/config/config';
import {AuthConfig} from '../common/config/auth.config';
import {HttpService} from '../common/http/http.service';
import {ToasterService} from 'angular2-toaster';
import {SeoService} from '../common/global/seo';
import {HomeService} from './home/home.service';
import {PositionService} from './position/position.service';
import {PostService} from './post/post.service';
import {PositionCategoryService} from './position_category/position_category.service';
import {LocationService} from '../common/service/location.service';
import {HotCompanyService} from './hot_company/hot_company.service';
import {EducationLevelService} from '../common/service/education_level.service';
import {ChatService} from '../common/chat/chat.service';
import {ChatComponent} from '../common/chat/chat.component';
import {IToasterModule} from '../common/iToaster/iToaster.module';
import {EnterpriseService} from './enterprise/enterprise.service';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {EnterpriseNavbarComponent} from "../common/enterprise-navbar/enterprise-navbar.component";


export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    FullLayoutComponent,
    SimpleLayoutComponent,
    JobSeekerNavbarComponent,
    EnterpriseNavbarComponent,
    FooterComponent,
    ChatComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    Ng2PageScrollModule,
    CollapseModule,
    AccordionModule,
    HttpModule,
    IToasterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http],
      }
    }),
  ],
  providers: [
    Auth,
    Config,
    AuthConfig,
    HttpService,
    ToasterService,
    SeoService,
    AccordionConfig,
    HomeService,
    PositionService,
    PostService,
    PositionCategoryService,
    LocationService,
    HotCompanyService,
    EducationLevelService,
    TabsetConfig,
    PaginationConfig,
    ChatService,
    EnterpriseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
