import {Component, OnInit, ViewChild, AfterViewChecked} from '@angular/core';
import {DashboardService} from "../company-dashboard.service";
import {Router} from "@angular/router";
import {ModalDirective} from "ngx-bootstrap";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {ICompany} from "../../service/company.service";
import {SeoService} from "../../../../common/global/seo";
import {json} from "ng2-validation/dist/json";



@Component({
  templateUrl: './select.company.component.html',
})
export class SelectCompanyComponent implements OnInit,AfterViewChecked {
  public companies: ICompany[] = [];
  public loading: boolean = false;
  public companyId: string;
  public companyIndex: number;

  @ViewChild('childModal') public childModal: ModalDirective;

  constructor(private dashboardService: DashboardService,
              private toasterService: ToasterService,
              private translate: TranslateService,
              private seoService: SeoService,
              private router: Router) {

  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('enterprise.load_company'),this.seoService.getTitleContent());
  }
  ngOnInit() {
    this.readCompany();
    localStorage.setItem('isApproved', 'true');
  }

  async readCompany(): Promise<any> {
    try {
      this.loading = true;
      let data = await this.dashboardService.findCompanyByUser({}).toPromise();
      this.companies = data.result;
      this.loading = false;
    } catch (err) {
      this.loading = false;

    }
  }

  selectCompany(company: ICompany) {
    const isApproved = company.isApproved ? 'true' : 'false';
    if (company.isApproved) {
      localStorage.setItem('company', company.id);
      localStorage.setItem('isApproved', isApproved);
      this.router.navigate(['/company', company.id, 'dashboard']);
    } else {
      localStorage.setItem('company', company.id);
      localStorage.setItem('isApproved', isApproved);
      this.router.navigate(['/company', company.id, 'prompt']);
    }
  }

  editCompany() {
      localStorage.setItem('companyedit', 'work');
      this.router.navigate(['/company', 'company-edit']);
  }

  removeCompany(index: number) {
    this.companyIndex = index;
    this.childModal.show();
  }

  async deleteCompany(): Promise<any> {
    try {
      await this.dashboardService.destroy(this.companies[this.companyIndex].id).toPromise();
      this.companies.splice(this.companyIndex, 1);
      this.childModal.hide();
      this.toasterService.pop('success', '', this.translate.instant('message.company_delete_success_msg'));
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('message.company_delete_error_msg'));

    }
  }

}
