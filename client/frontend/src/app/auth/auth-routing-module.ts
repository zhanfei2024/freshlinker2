import {NgModule}     from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthComponent} from "./auth.component";
import {LoginComponent} from "./login/login.component";
import {SignupComponent} from "./signup/signup.component";
import {EnterpriseLoginComponent} from "./enterprise-login/enterprise-login.component";
import {EnterpriseSignupComponent} from "./enterprise-signup/enterprise-signup.component";
import {ForgetPasswordComponent} from "./forget-password/forget-password.component";

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [

      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'signup',
        component: SignupComponent,
      },
      {
        path: 'forget-password',
        component: ForgetPasswordComponent,
      },
      {
        path: 'enterprise_login',
        component: EnterpriseLoginComponent,
      },
      {
        path: 'enterprise_signup',
        component: EnterpriseSignupComponent,
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
export class AuthRoutingModule {
}
