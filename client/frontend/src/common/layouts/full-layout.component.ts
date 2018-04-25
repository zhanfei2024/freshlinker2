import {Component, OnInit} from '@angular/core';
import {Auth} from '../../app/auth/auth.service';
import {Router} from '@angular/router';
import {SeoService} from '../global/seo';
import {I18nService} from "../i18n/i18n.service";
import {TranslateService} from "@ngx-translate/core";
import * as _ from "lodash";


@Component({
  selector: 'app-dashboard',
  templateUrl: './full-layout.component.html',
  providers: [I18nService]
})
export class FullLayoutComponent implements OnInit {
  self: any;
  isLogin: any;

  constructor(private auth: Auth,
              private router: Router,
              private translate: TranslateService,
              private seoService: SeoService) {

  }

  ngOnInit(): void {
    if (this.auth.isAuthenticated() && localStorage.getItem('role') === 'user') {
      this.isLogin = true;
    }
    if(_.isNull(localStorage.getItem('lang'))){
      this.translate.setDefaultLang('hk');
      this.translate.use('hk');
    }else{
      this.translate.setDefaultLang(localStorage.getItem('lang'));
      this.translate.use(localStorage.getItem('lang'));
    }
    // this.seoService.setTitle('FreshLinker – Hong Kong’s leading career platform for young talents.');
    this.seoService.setTag('og:image', 'assets/img/logo600*400.png');
    this.seoService.setTag('description', 'A platform that consolidates all the career planning and job seeking tools a young talent need; latest career news, companies information, interviewing tips, on/off campus career events and job opportunities.');
  }


  public logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
