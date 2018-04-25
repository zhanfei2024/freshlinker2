import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {IPlan, CompanyPlanPackageService} from "../../service/plan_package.service";
import {EnterpriseService} from "../../../enterprise/enterprise.service";
import * as _ from "lodash";
import {Router, ActivatedRoute} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";
import {CreditService} from "../../service/credit.service";
import {HomeService} from "../../../home/home.service";
import {SeoService} from "../../../../common/global/seo";

export interface IPlanInfo {
  id: string;
  name: string;
  price: string;
}

@Component({
  templateUrl: './plan_package_detail.component.html',
})
export class PlanPackageDetailComponent implements OnInit,AfterViewChecked {
  public companyId: string;
  public planInfo: any = {};
  public loading: boolean = false;

  public enterprise: IPlan = {};
  public tableLoading: boolean = false;

  public myDate: Date;
  public saveLoading: boolean = false;

  public planNum: string[] = ['1', '2', '3', '4'];
  public plans: IPlanInfo[] = [];

  constructor(private planService: CompanyPlanPackageService,
              private route: ActivatedRoute,
              private router: Router,
              private homeService: HomeService,
              private translate: TranslateService,
              private toasterService: ToasterService,
              private creditService: CreditService,
              private seoService: SeoService,
              private enterpriseService: EnterpriseService) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('enterprise.upgrade'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.companyId = localStorage.getItem('company');
    this.myDate = new Date();
    this.route.params.subscribe(
      (params) => {
        switch (this.route.url['_value'][0].path) {
          case "plan_package_detail":
            this.readPlan(params['id']);
            _.each(this.planNum, (value: string) => {
              this.readPlans(value);
            });
            break;
          case "plan_position_detail":
            this.readPlanyPosition(parseInt(params['id']));
        }
      }
    );
    this.readEnterprise();

  }

  async readPlanyPosition(index: number): Promise<any> {
    try {
      this.loading = true;
      let data = await this.homeService.getBanner('2').toPromise();
      let result = data.result.global;
      this.planInfo.id = index;
      this.planInfo.planEffectiveDay = result[index].meta.positionEffectiveDay;
      this.planInfo.positionQuota = result[index].meta.positionQuota;
      this.planInfo.oldPrice = result[index].meta.oldPrice;
      this.planInfo.price = result[index].meta.price;
      this.planInfo.displayName = result[index].displayName;
      this.planInfo.interview = result[index].meta.interview;
      this.planInfo.facebookPage = result[index].meta.facebookPage;
      this.loading = false;
    } catch (err) {
      this.loading = false;
    }
  }


  async  readPlan(id: string): Promise<any> {
    try {
      this.loading = true;
      let result = await this.planService.getPlan(id).toPromise();
      this.planInfo.id = result.id;
      this.planInfo.planEffectiveDay = result.meta.planEffectiveDay;
      this.planInfo.positionQuota = result.meta.positionQuota;
      this.planInfo.oldPrice = result.meta.oldPrice;
      this.planInfo.price = result.meta.price;
      this.planInfo.displayName = result.displayName;
      this.planInfo.interview = result.meta.interview;
      this.planInfo.facebookPage = result.meta.facebookPage;
      this.loading = false;
    } catch (err) {
      this.loading = false;
    }
  }

  async  readEnterprise(): Promise<any> {
    try {
      this.tableLoading = true;
      let result = await this.enterpriseService.find({}).toPromise();
      this.enterprise = result;
      this.tableLoading = false;
    } catch (err) {
      this.tableLoading = false;
    }
  }

  async  readPlans(value: string): Promise<any> {
    try {
      let result = await this.planService.getPlan(value).toPromise();
      this.plans.push({id: result.id, name: result.displayName, price: result.meta.price});
      this.plans = _.sortBy(this.plans, ['plan', 'id']);
    } catch (err) {
    }
  }

  async  setPlan(id: string): Promise<any> {
    try {
      this.loading = true;
      let result = await this.planService.getPlan(id).toPromise();
      this.planInfo.planEffectiveDay = result.meta.planEffectiveDay;
      this.planInfo.positionQuota = result.meta.positionQuota;
      this.planInfo.oldPrice = result.meta.oldPrice;
      this.planInfo.price = result.meta.price;
      this.planInfo.displayName = result.displayName;
      this.planInfo.id = id;
      this.planInfo.interview = result.meta.interview;
      this.planInfo.facebookPage = result.meta.facebookPage;
      this.loading = false;
    } catch (err) {
      this.loading = false;

    }
  }

  async submit(price: number) {
    this.saveLoading = true;
    if (price > this.enterprise.balance) {
      this.toasterService.pop('error', '', this.translate.instant('message.credit_card_balance_no'));
      this.router.navigate(['/company', this.companyId, 'racharge']);
      this.saveLoading = false;
    } else {
      if (this.route.url['_value'][0].path === 'plan_package_detail') {
        this.buyPlan();
      } else {
        this.buyPlanPosition();
      }
    }
  }


  async buyPlan(): Promise<any> {
    try {
      await this.creditService.buyPlan({'planId': this.planInfo.id}).toPromise();
      this.toasterService.pop('success', '', this.translate.instant('message.credit_card_balance_success'));
      this.router.navigate(['/company', this.companyId, 'dashboard']);

      this.saveLoading = false;
    } catch (err) {
      if (err.code === 40021) {
        this.toasterService.pop('error', '', this.translate.instant('message.company_plan_package_not_buy_twice'));
        this.saveLoading = false;
      }

    }
  }

  async buyPlanPosition(): Promise<any> {
    try {
      await this.creditService.buyPlanPosition({'planId': this.planInfo.id}).toPromise();
      this.toasterService.pop('success', '', this.translate.instant('message.credit_card_balance_success'));
      this.router.navigate(['/company', this.companyId, 'dashboard']);

      this.saveLoading = false;
    } catch (err) {
      if (err.code === 40021) {
        this.toasterService.pop('error', '', this.translate.instant('message.company_plan_package_not_buy_twice'));
        this.saveLoading = false;
      }

    }
  }


}
