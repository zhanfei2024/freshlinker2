import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {ICredit, CreditService} from "../service/credit.service";
import {IEnterprise, EnterpriseService} from "../../enterprise/enterprise.service";
import * as _ from 'lodash';
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {SeoService} from "../../../common/global/seo";


@Component({
  templateUrl: './recharge.component.html',
})
export class RechargeComponent implements OnInit,AfterViewChecked {
  public companyId: string;
  public money: number = 0;
  public defaultCredit: ICredit;
  public credits: ICredit[] = [];
  public enterprise: IEnterprise = {};
  public myDate: Date;
  public tableLoading: boolean = false;
  public saveLoading: boolean = false;
  public loading: boolean = false;
  constructor(private creditService: CreditService,
              private toasterService: ToasterService,
              private translate: TranslateService,
              private router: Router,
              private seoService: SeoService,
              private enterpriseService: EnterpriseService,) {

  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('enterprise.recharge_account'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.companyId = localStorage.getItem('company');
    this.myDate = new Date();
    this.readCreditCard();
    this.readEnterprise();
  }

  async readCreditCard(): Promise<any> {
    try {
      this.loading = true;
      let data = await this.creditService.get({}).toPromise();
      this.credits = data.result;
      this.checkDefault(this.credits);
      this.loading = false;
    } catch (err) {
      this.loading = false;
    }
  }

  async readEnterprise(): Promise<any> {
    try {
      this.tableLoading = true;
      let data = await this.enterpriseService.find({}).toPromise();
      this.enterprise = data.result;
      this.tableLoading = false;
    } catch (err) {
      this.tableLoading = false;
    }
  }

  checkDefault(credits: ICredit[]) {
    if(credits.length === 0) {
      this.toasterService.pop('error', '', this.translate.instant('message.credit_card_add_default'));
      this.router.navigate(['/company',this.companyId,'credit_card']);
    } else {
      _.each(credits, (val: ICredit) =>{
        if(val.default_source) this.defaultCredit = val;
      });
    }
  }

 async save(): Promise<any> {
    try{
      this.saveLoading = true;
      await this.creditService.recharger({'amount': this.money}).toPromise();
      this.toasterService.pop('success', '', this.translate.instant('message.credit_card_recharge_success'));
      this.saveLoading = false;
      this.router.navigate(['/company',this.companyId,'recharge-confirm']);
    }catch (err){
      this.saveLoading = false;
    }
  }

}
