import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {IAccount, CompanyService} from "../service/company.service";
import {IDate} from "../../user/user.service";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import * as _ from 'lodash';
import * as moment from 'moment';
import {IMeta} from "../../position/position.service";
import {SeoService} from "../../../common/global/seo";
import {IMyDateModel, INgxMyDpOptions} from "ngx-mydatepicker";
import {NgxMyDatePickerConfig} from "ngx-mydatepicker/dist/services/ngx-my-date-picker.config";


@Component({
  templateUrl: './consume.component.html',
  providers: [NgxMyDatePickerConfig]
})
export class ConsumeComponent implements OnInit,AfterViewChecked {
  public companyId: string;
  public accountStatus: any = [];
  public accountIndex: number = 1;
  public tableLoading: boolean = false;
  public changeTabLoading: boolean = false;
  public consumes: any = [];
  public loading: boolean = false;
  public itemsByPage: number = 5;
  public consumeLoading: boolean = false;

  public filter: IAccount = {};
  public params: IAccount = {
    limit: 5,
    page:1
  };
  public popup : any = {};
  public meta: IMeta = {pagination: {}};
  public myOptions: INgxMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
  };


  constructor(private toasterService: ToasterService,
              private companyService: CompanyService,
              private seoService: SeoService,
              private translate: TranslateService,) {

  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('account.expenses_record'),this.seoService.getTitleContent());
  }
  ngOnInit() {
    this.companyId = localStorage.getItem('company');
    this.change();
  }

  onDateChanged(event: IMyDateModel,type: string): void {
    switch (type){
      case 'startedDate':
        this.filter.startedDate = event.formatted;
        break;
      case 'endedDate':
        this.filter.endedDate = event.formatted;
        break;
    }
  }

  change() {
    this.consumes = [];
    this.changeTabLoading = true;
    this.consumeLoading = true;
    delete this.filter.startedDate;
    delete this.filter.endedDate;
    setTimeout(() => {
      this.changeTabLoading = false;
    }, 1);
    this.readCallServer();

  }


  searchAccount() {
    this.consumes = [];
    this.changeTabLoading = true;
    this.consumeLoading = true;
    setTimeout(() => {
      this.changeTabLoading = false;
    }, 1);
    this.readCallServer();
  }

  //加载分页
  async changePage(event: any) {
    this.params.page = event.page;
    this.params.limit = event.itemsPerPage;
     this.readCallServer();
  }


  async readCallServer(): Promise<any> {
    if (!_.isUndefined(this.filter.startedDate) && !_.isUndefined(this.filter.endedDate)) {
      if (this.filter.startedDate > this.filter.endedDate) {
        this.toasterService.pop('error', '', this.translate.instant('message.date_add_error_msg'));
      } else {
        this.params.startedDate = moment(this.filter.startedDate['formatted']).format('YYYY-MM-DD');
        this.params.endedDate = moment(this.filter.endedDate['formatted']).format('YYYY-MM-DD');
      }
    }
    try {
      this.loading = true;
      let data = await this.companyService.getConsume(this.params).toPromise();
      this.consumes = data.result;
      this.meta = data.meta;
      this.loading = false;
      this.consumeLoading = false;
    } catch (err) {
      this.loading = false;
      this.consumeLoading = false;
    }
  }

}
