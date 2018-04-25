import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {IJobOffer, JobOfferService} from "../../service/company_job_offer.service";
import {IFilter, IMeta} from "../../../post/post.service";
import * as _ from "lodash";
import {DashboardService} from "../../company-dashboard/company-dashboard.service";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";
import {SeoService} from "../../../../common/global/seo";
import {number} from "ng2-validation/dist/number";
import set = Reflect.set;

@Component({
  templateUrl: './job-offer-list.component.html',
})
export class JobOfferListComponent implements OnInit, AfterViewChecked{
  public jobOffer: any = {};
  public types: any = {};
  public companyId: string;
  public itemsByPage: number = 5;
  public jobOffers: IJobOffer[] = [];

  public tableLoading: boolean = false;
  public jobOfferLoading: boolean = false;
  public changeTabLoading: boolean = false;
  public joblistLoading: boolean = false;
  public meta: IMeta = {pagination: {}};
  public changeState = true;
  public prveFilter = {
    page: number,
    itemsPerPage: number
  };
  public filter: IFilter = {
    limit: 4,
    page: 1,
    search: ''
  };

  constructor(private jobOfferService: JobOfferService,
              private translate: TranslateService,
              private toasterService: ToasterService,
              private seoService: SeoService,
              private dashboardService: DashboardService) {

  }
  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('enterprise.position_offer'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.companyId = localStorage.getItem('company');
    this.JobCallServer();
  }

  changeTab() {
    this.jobOffers = [];
    this.filter.search = '';
    this.changeTabLoading = true;
    this.jobOfferLoading = true;
    setTimeout(() => {
      this.changeTabLoading = false;
    }, 1000);

  }

  searchJobOffer() {
    this.jobOffers = [];
    this.jobOfferLoading = true;
    this.changeTabLoading = true;
    setTimeout(() => {
      this.changeTabLoading = false;
    }, 1000);
    this.JobCallServer();
  }

  changeSearch() {
    setTimeout(() => {
      if (this.filter.search === undefined) this.searchJobOffer();
    }, 3000);
  }

  //加载分页
  async changePage(event: any) {
    this.joblistLoading = true;
    this.changeState = false;
    this.filter.page = event.page;
    this.filter.limit = event.itemsPerPage;
    await this.JobCallServer();
  }

  async JobCallServer(): Promise<any> {
    try {
      this.tableLoading = true;
      this.joblistLoading = true;
      this.jobOfferLoading = true;
      this.jobOffers = [];
      let data = await this.jobOfferService.get(localStorage.getItem('company'), this.filter.search === '' ? _.omit(this.filter, 'search') : this.filter).toPromise();
      _.each(data.result, async(value: any) => {
        if (value.position !== null) {
          value['isExpired'] = await this.dashboardService.checkExpired(value.position.expiredDate, new Date());
          if (value.position.active && !value['isExpired']) {
              value['inviteNum'] = await this.readInviteNum(value);
              this.jobOffers.push(value);
          }
        }
      });
      this.meta = data.meta;
      this.tableLoading = false;
      this.jobOfferLoading = false;
      this.joblistLoading = false;
    } catch (err) {
      this.tableLoading = false;
      this.jobOfferLoading = false;
      this.joblistLoading = false;
    }
  }


  async readInviteNum(value: any): Promise<number> {
    try {
      let data = await this.jobOfferService.getInviteNum(value.companyId, value.id).toPromise();
      return Promise.resolve(data.result.count);
    } catch (err) {
    }
  }

  async deleteJobOffer(id: number): Promise<any> {
    try {
      this.tableLoading = true;
      this.jobOfferLoading = true;
      await this.jobOfferService.destroy(localStorage.getItem('company'), this.jobOffers[id].id).toPromise();
      let index = _.findIndex(this.jobOffers, {id: this.jobOffers[id].id});
      if (index !== -1) {
        this.jobOffers.splice(index, 1);
         if (this.jobOffers.length === 0 && this.filter.page - 1 > 0 ) {
          this.filter.page -= 1;
        }
      }
      this.toasterService.pop('success', '', this.translate.instant('message.delete_success_msg'));
      this.tableLoading = false;
      this.jobOfferLoading = false;
    } catch (err) {}
  }

}
