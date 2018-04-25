import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {Auth} from '../auth.service';
import {ToasterService} from 'angular2-toaster/angular2-toaster';
import {Router} from '@angular/router';
import {TranslateService} from "@ngx-translate/core";
import {SeoService} from "../../../common/global/seo";

@Component({
  templateUrl: './enterprise-login.component.html',
})
export class EnterpriseLoginComponent implements OnInit, AfterViewChecked {

  email: string;
  password: string;
  loginLoading: boolean = false;
  isCollapsed: boolean;

  constructor(private auth: Auth,
              private toasterService: ToasterService,
              private translate: TranslateService,
              private seoService: SeoService,
              private router: Router) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('auth.login_enterprise'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.auth.handleAuthentication();
  }

  async enterpriseLogin() {
    this.loginLoading = true;
    try {
      await this.auth.login(this.email, this.password, true).toPromise();
      this.router.navigate(['/enterprise', 'enterprise_show']);
       this.loginLoading = false;
    } catch (err) {
      this.loginLoading = false;
    }
  }

}
