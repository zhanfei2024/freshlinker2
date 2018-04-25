import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {BreadcrumbService} from '../../common/breadcrumb/breadcrumb.service';
import {HotCompanyService, ICompany} from './hot_company.service';
import {IMeta, IFilter} from '../post/post.service';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {SeoService} from '../../common/global/seo';
import {TranslateService} from '@ngx-translate/core';
import {Auth} from "../auth/auth.service";
import {ChatService} from "../../common/chat/chat.service";
import {UserService} from "../user/user.service";


@Component({
  templateUrl: './hot_company.component.html',
})

export class HotCompanyComponent implements OnInit, AfterViewChecked {
  public hotCompany: ICompany;
  public companyLoading: boolean;
  public meta: IMeta = {pagination: {}};
  public url: string;
  public vipUrl: string;
  public pageNum: IFilter = {
    page: 1,
    limit: 12,
    search: ''
  };

  public constructor(private breadcrumbService: BreadcrumbService,
                     private route: ActivatedRoute,
                     private seoService: SeoService,
                     private userService:UserService,
                     private auth: Auth,
                     private router: Router,
                     private chatService: ChatService,
                     private translate: TranslateService,
                     private hotCompanyService: HotCompanyService) {

  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('company.company_list'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.breadcrumbService.clear();
    this.breadcrumbService.set({title: 'company.company_list', router: '/hot_company'});

    this.route.queryParams.subscribe(
      (queryParams) => {
        if (!_.isUndefined(queryParams['search'])) {
          this.pageNum.search = queryParams['search'];
          this.readCompany();
        } else {
          this.pageNum.search = '';
          this.route.params.subscribe(
            (params) => {
              this.readCompany();
            }
          );

        }
      }
    );
  }

  //加载分页
  async changePage(event: any) {
    this.pageNum.page = event.page;
    this.pageNum.limit = event.itemsPerPage;
    await this.readCompany();
  }

  async readCompany(): Promise<any> {
    try {
      this.companyLoading = true;
      let data = await this.hotCompanyService.get(this.pageNum.search === '' ? _.omit(this.pageNum, 'search') : this.pageNum).toPromise();
      this.meta = data.meta;
      this.hotCompany = data.result;
      _.each(this.hotCompany, (value: any) => {
        if (value.isVIP) {
          value['vipUrl'] = `/upgrade_company/${value.id}/profile`;
        } else {
          value['vipUrl'] = `/company/${value.id}/company-list`
        }
      });
      this.companyLoading = false;

    } catch (err) {
      this.companyLoading = false;

    }
  }

  async contact(companyId: string): Promise<any> {
    if(this.auth.isAuthenticated() && localStorage.getItem('role') === 'user'){
      try {
        await this.userService.updateContent(companyId).toPromise();
        this.chatService.showChat(true);
      } catch (err) {

      }
    }else{
      this.router.navigate(['auth','login']);
    }
  }


}
