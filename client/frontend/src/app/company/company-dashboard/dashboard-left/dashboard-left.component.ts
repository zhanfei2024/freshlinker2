import {Component, OnInit} from '@angular/core';
import {DashboardService} from '../company-dashboard.service';
import {ICompany} from '../../service/company.service';


@Component({
  selector: 'dashboard-left',
  templateUrl: './dashboard-left.component.html',
})
export class DashboardLeftComponent implements OnInit {
  public dashboardLoading = false;
  public company: ICompany = {};
  public companyId: string;
  public descriptionShow = false;

  constructor(private dashboardService: DashboardService) {

  }

  ngOnInit() {
    this.readCompany();
  }

  async  readCompany(): Promise<any> {
    try {
      this.dashboardLoading = true;
      this.companyId = localStorage.getItem('company');
      const data = await this.dashboardService.findCompany(this.companyId).toPromise();
      this.company = data.result;
      this.dashboardLoading = false;
    } catch (err) {
      this.dashboardLoading = false;

    }
  }

}
