import {NgModule} from '@angular/core';
import {AuthComponent} from './auth.component';
import {LoginComponent} from './login/login.component';
import {AuthRoutingModule} from './auth-routing-module';
import {LoginCheckResolve} from './login-check-resolve.service';
import { SignupComponent } from './signup/signup.component';


import { Http, RequestOptions } from '@angular/http';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import {EnterpriseLoginComponent} from "./enterprise-login/enterprise-login.component";
import {EnterpriseSignupComponent} from "./enterprise-signup/enterprise-signup.component";
import {CompanyLoginCheckResolve} from "./login-company-check-resolve.service";
import {ForgetPasswordComponent} from "./forget-password/forget-password.component";
import {SharedModule} from "../../common/shared/shared.module";
import {UserService} from "../user/user.service";

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({
    tokenName: 'token',
    tokenGetter: (() => sessionStorage.getItem('id_token')),
    globalHeaders: [{'Content-Type':'application/json'}],
  }), http, options);
}

@NgModule({
  imports: [
    SharedModule,
    AuthRoutingModule,
  ],
  providers: [
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    },
    LoginCheckResolve,
    CompanyLoginCheckResolve,
    UserService
  ],
  declarations: [
    AuthComponent,
    LoginComponent,
    SignupComponent,
    EnterpriseSignupComponent,
    EnterpriseLoginComponent,
    ForgetPasswordComponent
  ]
})
export class AuthModule {
}
