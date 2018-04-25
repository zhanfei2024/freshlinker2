import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {Auth} from '../auth.service';
import {Router} from "@angular/router";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './enterprise-signup.component.html',
})
export class EnterpriseSignupComponent implements OnInit, AfterViewChecked {

  email: string;
  password: string;
  signupLoading: boolean = false;
  isCollapsed: boolean;

  constructor(private auth: Auth,
              private translate: TranslateService,
              private seoService: SeoService,
              private router: Router) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('auth.signup_enterprise'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.auth.handleAuthentication();
  }

  async signup() {
    this.signupLoading = true;
    try {
      await this.auth.signUp(this.email, this.password, true).toPromise();
      this.router.navigate(['/enterprise/enterprise_show']);
      this.signupLoading = false;
    } catch (err) {
      this.signupLoading = false;
    }
  }

}
