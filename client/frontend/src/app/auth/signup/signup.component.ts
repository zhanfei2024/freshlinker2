import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {Auth} from '../auth.service';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {SeoService} from '../../../common/global/seo';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from "angular2-toaster";

@Component({
  templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit, AfterViewChecked {

  email: string;
  password: string;
  signupLoading: boolean = false;
  isCollapsed: boolean;

  constructor(private auth: Auth,
              private seoService: SeoService,
              private translate: TranslateService,
              private toasterService: ToasterService,
              private router: Router,
              private location: Location) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('auth.signup_user'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.auth.handleAuthentication();
  }

  async signup() {
    this.signupLoading = true;
    try {
      await this.auth.signUp(this.email, this.password, false).toPromise();
      if (localStorage.getItem('loginRequest') === 'back') {
        this.location.back()
      } else {
        this.router.navigate(['/user', 'dashboard']);
        this.toasterService.pop('success', 'Success', this.translate.instant('message.register_success_message'));
      }
      this.signupLoading = false;
    } catch (err) {
      this.signupLoading = false;
    }
  }

}
