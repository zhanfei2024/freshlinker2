import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {Auth} from '../auth.service';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {SeoService} from '../../../common/global/seo';
import {TranslateService} from '@ngx-translate/core';


@Component({
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, AfterViewChecked {
  email: string;
  password: string;
  loginLoading: boolean = false;
  isCollapsed: boolean;

  constructor(private auth: Auth,
              private translate: TranslateService,
              private seoService: SeoService,
              private router: Router,
              private location: Location) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('auth.login_user'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.auth.handleAuthentication();
  }


  async login() {
    this.loginLoading = true;
    try {
      await this.auth.login(this.email, this.password, false).toPromise();
      if (localStorage.getItem('loginRequest') === 'back') {
        this.location.back()
      } else {
        this.router.navigate(['/user', 'dashboard']);
      }
      this.loginLoading = false;
    } catch (err) {
      this.loginLoading = false;
    }
  }

}
