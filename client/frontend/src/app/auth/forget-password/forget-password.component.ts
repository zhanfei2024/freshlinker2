import {Component} from '@angular/core';
import {Auth} from "../auth.service";
import {I18nService} from "../../../common/i18n/i18n.service";
import {Router} from "@angular/router";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './forget-password.component.html',
})
export class ForgetPasswordComponent {
  email: string;
  signupLoading: boolean = false;
  isCollapsed: boolean;
  isExist: boolean = false;

  constructor(private auth: Auth,
              private translate: TranslateService,
              private toasterService: ToasterService,) {

  }

  save() {
    this.isUserExist();
  }

  async ForgetPassword() {
    this.signupLoading = true;
    try {
      await this.auth.popupForgetPassword(this.email).toPromise();
      this.signupLoading = false;
      this.toasterService.pop('success', 'Success', this.translate.instant('message.forget_password'));
    } catch (err) {
      this.signupLoading = false;
      this.toasterService.pop('error', 'Error', err.description);
    }
  }

  async isUserExist() {
    try {
      await this.auth.isUserExist({email: this.email}).toPromise();
      this.ForgetPassword();
    } catch (err) {
      this.toasterService.pop('error', 'Error', this.translate.instant('message.user_login_not_exists'));
    }
  }

}
