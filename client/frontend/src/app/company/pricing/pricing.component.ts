import {Component, OnInit, AfterViewChecked, Inject, ViewChild, ElementRef} from '@angular/core';
import {CompanyPlanPackageService} from "../service/plan_package.service";
import {Router} from "@angular/router";
import {Auth} from "../../auth/auth.service";
import {HomeService} from "../../home/home.service";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";
declare const jQuery :  any;


@Component({
  templateUrl: './pricing.component.html',
})
export class PricingComponent implements OnInit,AfterViewChecked {
  public checked: string;
  public oneLoading: boolean = false;
  public one: any = {};
  public threeLoading: boolean = false;
  public three: any = {};
  public sixLoading: boolean = false;
  public six: any = {};
  public annualLoading: boolean = false;
  public annual: any = {};
  public liteLoading: boolean = false;
  public lite: any = {};
  public standardLoading: boolean = false;
  public standard: any = {};
  public professionLoading: boolean = false;
  public profession: any = {};
  public premiumLoading: boolean = false;
  public premium: any = {};
  public enterpriseLoading: boolean = false;
  public enterprise: any = {};
  public url: string;
  public nineOpen: boolean;

  @ViewChild('contentSevenTitle') contentSevenTitle: ElementRef;
  constructor(private planService: CompanyPlanPackageService,
              private homeService: HomeService,
              private seoService: SeoService,
              private translate: TranslateService,
              private auth: Auth,
              private router: Router) {

  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('footer.pricing'),this.seoService.getTitleContent());
  }
  ngOnInit() {
    this.readLite();
    this.readBanner();
    if(location.pathname === '/company/pricing/upgradePage'){
      this.scrol();
    }
  }

  gotoSignUp(): void {
    if (!localStorage.getItem('role')) {
      this.router.navigate(['/enterprise', 'signup'])
    } else if (localStorage.getItem('role') === 'enterprise') {
      return;
    }
  }
  async readBanner(): Promise<any> {
    try {
      this.oneLoading = true;
      this.threeLoading = true;
      this.sixLoading = true;
      this.annualLoading = true;
      let result = await this.homeService.getBanner('2').toPromise();
      let obj = result.result.global;
      this.one.displayName = obj[0].displayName;
      this.one.description = obj[0].description;
      this.one.oldPrice = obj[0].meta.oldPrice;
      this.one.price = obj[0].meta.price;
      this.one.positionEffectiveDay = obj[0].meta.positionEffectiveDay;
      this.one.positionQuota = obj[0].meta.positionQuota;
      this.oneLoading = false;

      this.three.displayName = obj[1].displayName;
      this.three.description = obj[1].description;
      this.three.oldPrice = obj[1].meta.oldPrice;
      this.three.price = obj[1].meta.price;
      this.three.positionEffectiveDay = obj[1].meta.positionEffectiveDay;
      this.three.positionQuota = obj[1].meta.positionQuota;
      this.threeLoading = false;

      this.six.displayName = obj[2].displayName;
      this.six.description = obj[2].description;
      this.six.oldPrice = obj[2].meta.oldPrice;
      this.six.price = obj[2].meta.price;
      this.six.positionEffectiveDay = obj[2].meta.positionEffectiveDay;
      this.six.positionQuota = obj[2].meta.positionQuota;
      this.sixLoading = false;

      this.annual.displayName = obj[3].displayName;
      this.annual.description = obj[3].description;
      this.annual.oldPrice = obj[3].meta.oldPrice;
      this.annual.price = obj[3].meta.price;
      this.annual.positionEffectiveDay = obj[3].meta.positionEffectiveDay;
      this.annual.positionQuota = obj[3].meta.positionQuota;
      this.annualLoading = false;

      this.enterprise.displayName = obj[4].displayName;
      this.enterprise.description = obj[4].description;
      this.enterprise.oldPrice = obj[4].meta.oldPrice;
      this.enterprise.price = obj[4].meta.price;
      this.enterprise.positionEffectiveDay = obj[4].meta.positionEffectiveDay;
      this.enterprise.positionQuota = obj[4].meta.positionQuota;
      this.enterpriseLoading = false;

    } catch (err) {
      this.oneLoading = false;
      this.sixLoading = false;
      this.threeLoading = false;
      this.annualLoading = false;

    }
  }

  async readLite(): Promise<any> {
    try {
      this.liteLoading = true;
      let result = await this.planService.getPublicPlan().toPromise();
      this.lite.displayName = result[0].displayName;
      this.lite.description = result[0].description;
      this.lite.features = result[0].features;
      this.lite.oldPrice = result[0].meta.oldPrice;
      this.lite.price = result[0].meta.price;
      this.lite.positionQuota = result[0].meta.positionQuota;
      this.lite.planEffectiveDay = result[0].meta.planEffectiveDay;
      this.lite.interview = result[0].meta.interview;
      this.lite.facebookPage = result[0].meta.facebookPage;
      this.liteLoading = false;
      this.standard.displayName = result[1].displayName;
      this.standard.description = result[1].description;
      this.standard.features = result[1].features;
      this.standard.oldPrice = result[1].meta.oldPrice;
      this.standard.price = result[1].meta.price;
      this.standard.positionQuota = result[1].meta.positionQuota;
      this.standard.planEffectiveDay = result[1].meta.planEffectiveDay;
      this.standard.interview = result[1].meta.interview;
      this.standard.facebookPage = result[1].meta.facebookPage;
      this.standardLoading = false;
      this.profession.displayName = result[2].displayName;
      this.profession.description = result[2].description;
      this.profession.features = result[2].features;
      this.profession.oldPrice = result[2].meta.oldPrice;
      this.profession.price = result[2].meta.price;
      this.profession.positionQuota = result[2].meta.positionQuota;
      this.profession.planEffectiveDay = result[2].meta.planEffectiveDay;
      this.profession.interview = result[2].meta.interview;
      this.profession.facebookPage = result[2].meta.facebookPage;
      this.professionLoading = false;
      this.premium.displayName = result[3].displayName;
      this.premium.description = result[3].description;
      this.premium.features = result[3].features;
      this.premium.oldPrice = result[3].meta.oldPrice;
      this.premium.price = result[3].meta.price;
      this.premium.positionQuota = result[3].meta.positionQuota;
      this.premium.planEffectiveDay = result[3].meta.planEffectiveDay;
      this.premium.interview = result[3].meta.interview;
      this.premium.facebookPage = result[3].meta.facebookPage;
      this.premiumLoading = false;
    } catch (err) {
      this.liteLoading = false;
      this.standardLoading = false;
      this.premiumLoading = false;
      this.professionLoading = false;

    }
  }

  downLoad(url: string) {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['auth', 'enterprise_login']);
    } else {
      window.open(url);
    }
  }

  goPositonState(id: string) {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/company','plan_position_detail',id]);
    } else {
      this.router.navigate(['auth', 'enterprise_signup'])
    }
  }

  goState(id: string) {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/company','plan_package_detail',id]);
    } else {
      this.router.navigate(['auth', 'enterprise_signup'])
    }
  }

  goPrice() {
    if (this.auth.isAuthenticated() && localStorage.getItem('role') === 'enterprise') {
    } else  {
      this.router.navigate(['auth', 'enterprise_signup']);
    }
  }

  postJob() {
    if (this.auth.isAuthenticated()) {
      if (localStorage.getItem('company') !== null) {
        this.router.navigate(['/company', localStorage.getItem('company'), 'company_positions_create'])
      } else {
        this.router.navigate(['/company','select'])
      }
    } else {
      this.router.navigate(['auth', 'enterprise_signup'])
    }
  }

  scrol() {
    setTimeout(() => {
      let hmt = document.getElementById('html');
      document.body.scrollTop = this.contentSevenTitle.nativeElement.offsetTop;
      hmt.scrollTop = this.contentSevenTitle.nativeElement.offsetTop;
    }, 300);
  }


}
