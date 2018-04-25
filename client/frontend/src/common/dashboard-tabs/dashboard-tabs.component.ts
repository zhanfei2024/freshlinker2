import {Component, OnInit} from '@angular/core';
import {Auth} from "../../app/auth/auth.service";
import {CompanyService, ICompany} from "../../app/company/service/company.service";
import {DashboardService} from "../../app/company/company-dashboard/company-dashboard.service";
import {ChatService} from "../chat/chat.service";
import * as _ from "lodash";


@Component({
  selector: 'dashboard-tabs',
  templateUrl: './dashboard-tabs.component.html',
  styleUrls: ['./dashboard-tabs.component.css'],
  providers: [DashboardService,Auth]
})
export class DashboardTabsComponent implements OnInit {
  public companyId: string;
  public company: ICompany = {};
  public isRead: boolean;

  constructor(private dashboardService: DashboardService,
              private companyService: CompanyService,
              private chatSevice: ChatService) {
  }

  ngOnInit(): void {
    this.readCompany();
    this.chatLogin();
    if(!_.isUndefined(localStorage.getItem('isCompanyRead')) && localStorage.getItem('isCompanyRead') === 'true'){
      this.isRead = true;
    }
    this.chatSevice.getIsRead().subscribe((isRead)=>{
      this.isRead = isRead;
    })
  }

  async  readCompany(): Promise<any> {
    try {
      this.companyId = localStorage.getItem('company');
      let data = await this.dashboardService.findCompany(this.companyId).toPromise();
      this.company = data;
    } catch (err) {

    }
  }
  async chatLogin():Promise<any>{
    try{
       await this.companyService.getChatLogin(this.companyId,{}).toPromise();
    }catch (err){
    }
  }

}
