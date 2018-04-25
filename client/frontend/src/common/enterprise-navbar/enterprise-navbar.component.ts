import {Component, OnInit, Input} from '@angular/core';
import {ToasterService} from "angular2-toaster";
import {TranslateService} from '@ngx-translate/core';
import {Router} from "@angular/router";
import {Auth} from "../../app/auth/auth.service";
import {AuthConfig} from "../config/auth.config";
import {EnterpriseService, IEnterprise} from "../../app/enterprise/enterprise.service";
import {DashboardService} from "../../app/company/company-dashboard/company-dashboard.service";
import {EnterpriseHttpService} from "../http/enterprise.http.service";
import {CompanyService} from "../../app/company/service/company.service";
import * as _ from "lodash";
import {ChatService} from "../chat/chat.service";

@Component({
  selector: 'enterprise-navbar',
  templateUrl: './enterprise-navbar.component.html',
  providers: [EnterpriseService, Auth, AuthConfig, EnterpriseHttpService, DashboardService, ToasterService, TranslateService, CompanyService]
})
export class EnterpriseNavbarComponent implements OnInit {
  @Input() count: string;
  public isLogin: boolean = false;
  public currentLang: string;
  public companyId: string;
  public isCollapsed: boolean;
  public companyExit: boolean = false;
  public enterprise: IEnterprise;
  public news: any[] = [];
  public isRead: boolean = false;
  constructor(private auth: Auth,
              private router: Router,
              private enterpriseService: EnterpriseService,
              private companyService: CompanyService,
              private dashboardService: DashboardService,
              private chatSevice: ChatService,
              private translate: TranslateService) {
  }

  public disabled: boolean = false;
  public status: { isopen: boolean } = {isopen: false};

  ngOnInit(): void {
    if (localStorage.getItem('role') === 'enterprise') {
      this.isLogin = this.auth.isAuthenticated();
      this.readEnterprise();
      if (localStorage.getItem('company') !== null) {
        this.getRead();
        this.chatSevice.getIsRead().subscribe((isRead) => {
          this.isRead = isRead;
          if (!this.isRead) {
            this.news = [];
          }
        })
      }
    }

    this.currentLang = this.translate.instant('lang.language');
  }
  /*点击我的公司时，判断该公司审核状态，如已审核通过，跳转到公司工作台，如未审核通过，跳转到审核提示页*/
  gotoCompany(companyId: number): void {
    const isApproved = localStorage.getItem('isApproved');
    switch (isApproved) {
      case 'false':
        this.router.navigate(['/company', companyId, 'prompt']);
        break;
      case 'true':
        this.router.navigate(['/company', companyId, 'dashboard']);
        break;
    }
  }
  public setLang(lang: string): void {
    switch (lang) {
      case 'zh-cn':
        this.translate.use('cn');
        localStorage.setItem('lang', 'cn');
        this.currentLang = this.translate.instant('lang.zh-cn');
        break;
      case 'en-us':
        this.translate.use('en');
        localStorage.setItem('lang', 'en');
        this.currentLang = this.translate.instant('lang.en-us');
        break;
      case 'zh-hk':
        this.translate.use('hk');
        localStorage.setItem('lang', 'hk');
        this.currentLang = this.translate.instant('lang.zh-hk');
        break;
    }
  }

  async readEnterprise(): Promise<any> {
    try {
      let data = await this.enterpriseService.find({}).toPromise();
      this.enterprise = data;
      if (localStorage.getItem('company') !== null) {
        this.companyId = localStorage.getItem('company');
        this.isApprovedCompany();
      } else {
        this.readCompanyByUser();
      }
    } catch (err) {
    }
  }

  async isApprovedCompany(): Promise<any> {
    try {
      let data = await this.dashboardService.findCompanyByUser({}).toPromise();
      this.companyExit = data.result[0].isApproved ? true : false;
    } catch (err) {
    }
  }

  async readCompanyByUser(): Promise<any> {
    try {
      let data = await this.dashboardService.findCompanyByUser({}).toPromise();
      if (data.result.length === 1 && data.result[0].isApproved) {
        this.router.navigate(['/company', data.result[0].id, 'dashboard']);
        localStorage.setItem('company', data.result[0].id);
        this.companyId = data.result[0].id;
        this.companyExit = true;
      } else if (data.result.length > 1 && !localStorage.getItem('company') && !localStorage.getItem('companyedit')) {
        this.router.navigate(['/company', 'select']);
      } else if (data.result.length === 0) {
        this.router.navigate(['/company', 'company-edit']);
      }
    } catch (err) {
    }
  }


  public logout(): void {
    this.auth.logout();
    this.isLogin = false;
    this.router.navigate(['/']);
    localStorage.removeItem('changeTabId');
    localStorage.removeItem('postCompanyId');
  }

  //获取未读消息
  async getRead(): Promise<void> {
    let data = await this.companyService.getReviews(localStorage.getItem('company'), {isRead: false}).toPromise();
    this.news = data.result;
    if (this.news.length > 0) {
      this.isRead = true;
      localStorage.setItem('isCompanyRead',_.toString(this.isRead));
      this.chatSevice.isRead(this.isRead);
    }
  }

  async update(companyId: string, id: string, str: string): Promise<any> {
    try {
      switch (str) {
        case 'company-list':
          localStorage.setItem('commentState', '4');
          break;
        case 'profile':
          localStorage.setItem('commentState', '4');
          break;
      }
      await this.companyService.updateMsg(companyId, id).toPromise();
      let index = _.findIndex(this.news, {id: id});
      if (index !== -1) {
        this.news.splice(index, 1);
        if (this.news.length === 0) {
          this.isRead = false;
          localStorage.setItem('isCompanyRead',_.toString(this.isRead));
          this.chatSevice.isRead(this.isRead);
        }
      }
    } catch (err) {
    }

  }


}
