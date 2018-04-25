import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {IEnterprise} from "../../enterprise/enterprise.service";
import {ICompany, ITab, IChart, IFilter, IMeta} from "../../position/position.service";
import {DashboardService} from "../company-dashboard/company-dashboard.service";
import {CompanyService} from "../service/company.service";
import {CompanyPositionService, IPosition} from "../service/company-position.service";
import * as _ from "lodash";
import * as moment from "moment";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";
import {Router} from "@angular/router";
import {SeoService} from "../../../common/global/seo";
import {BsDropdownConfig} from "ngx-bootstrap";
import {number} from "ng2-validation/dist/number";


@Component({
  templateUrl: './company-position.component.html',
  providers: [BsDropdownConfig]
})
export class CompanyPositionComponent implements OnInit, AfterViewChecked {
  public company: ICompany[] = [];
  public enterprise: IEnterprise = {};
  public tableLoading: boolean = false;

  // position
  public positions: IPosition[] = [];
  public positionStatus: ITab[] = [];
  public meta: IMeta = {pagination: {}};
  public changeTabLoading: boolean = false;
  public positionIndex: number = 1;
  public currentDate: string;
  public positionLoading: boolean = false;
  public prveFilter = {
    page: number,
    itemsPerPage: number
  };
  public filter: IFilter = {
    limit: 5,
    page: 1,
    active: null,
    minExpiredDate: null,
    maxExpiredDate: null,
    search: '',
  };

  // chart
  public candidateNum: number = 0;

  //educationChart
  public educationChartLabels: IChart[] = [];
  public educationChartData: IChart[] = [];

  //experienceChart
  public experienceChartLabels: IChart[] = [];
  public experienceChartData: IChart[] = [];

  // skillChart
  public skillChartLabels: IChart[] = [];
  public skillChartData: IChart[] = [];

  // schoolChart
  public schoolChartLabels: IChart[] = [];
  public schoolChartData: IChart[] = [];

  // subjectChart
  public subjectChartLabels: IChart[] = [];
  public subjectChartData: IChart[] = [];

  public chartLoading: boolean = false;
  public isSkill: boolean = false;
  public isSubject: boolean = false;
  public isSchool: boolean = false;
  public pieChartType: string = 'pie';
  public backgroundColor = [{
    backgroundColor: [
      '#e9c83b', '#00b216', '#205080', '#ff7b9a', '#f44543', '#ffab45', '#4edfeb'
    ],
    hoverBackgroundColor: [
      '#e9c83b', '#00b216', '#205080', '#ff7b9a', '#f44543', '#ffab45', '#4edfeb'
    ]
  }];

  public options: any = {
    legend: {
      display: true,
      labels: {
        fontColor: '#666'
      }
    }
  };

  public polarAreaLegend: boolean = true;

  constructor(private dashboardService: DashboardService,
              private companyPositionService: CompanyPositionService,
              private translate: TranslateService,
              private router: Router,
              private toasterService: ToasterService,
              private seoService: SeoService,
              private companyService: CompanyService) {

  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('enterprise.position_management'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.positionStatus = [
      {
        id: 1,
        name: 'position.effective_position'
      },
      {
        id: 2,
        name: 'position.offline_position'
      },
      {
        id: 3,
        name: 'position.expired_position'
      }
    ];
    this.readCompany();
    this.readEnterprise();
    this.currentDate = moment(new Date()).format('YYYY-MM-DD');
    if (localStorage.getItem('positionTabId')) {
      this.positionTab(+localStorage.getItem('positionTabId'))
    }
  }

  async readCompany(): Promise<any> {
    try {
      let data = await this.dashboardService.findCompanyByUser().toPromise();
      this.company = data.result;
    } catch (err) {
    }
  }

  async readEnterprise(): Promise<any> {
    try {
      let data = await this.companyService.getEnterprise({}).toPromise();
      this.enterprise = data.result;
      let positionExpiredDate = +moment(this.enterprise['positionExpiredDate']).format('YYYY-MM-DD').replace(/-/g, '')
      let dateNow = +moment(new Date()).format('YYYY-MM-DD').replace(/-/g, '');
      if (dateNow > positionExpiredDate) {
        this.enterprise.positionQuota = 0;
      }
    } catch (err) {
    }
  }

  public positionTab(id: number) {
    this.changeTabLoading = true;
    this.positionIndex = id;
    // this.positions = [];
    this.positionLoading = true;
    this.filter.search = '';
    switch (id) {
      case 1:
        this.filter.active = true;
        this.filter.maxExpiredDate = '';
        this.filter.minExpiredDate = this.currentDate;
        this.filter.page = 1;
        break;
      case 2:
        delete this.filter.maxExpiredDate;
        delete this.filter.minExpiredDate;
        this.filter.active = false;
        this.filter.page = 1;
        break;
      case 3:
        delete this.filter.active;
        delete this.filter.minExpiredDate;
        this.filter.maxExpiredDate = this.currentDate;
        this.filter.page = 1;
        break;
    }
    this.positionCallServer();
    this.changeTabLoading = false;
    localStorage.setItem('positionTabId', _.toString(id))
  }

  searchPosition() {
    this.changeTabLoading = true;
    // this.positions = [];
    this.positionLoading = true;
    setTimeout(() => {
      this.changeTabLoading = false;
    }, 1000);
    this.positionCallServer();
  }


  //加载分页
  async changePage(event: any) {
    this.filter.page = event.page;
    this.filter.limit = event.itemsPerPage;
    await this.positionCallServer();
  }

  async positionCallServer(): Promise<any> {
    try {
      this.tableLoading = true;
      this.positionLoading = true;
      let data = await this.companyPositionService.getEnterprisePositionByCompany(localStorage.getItem('company'), this.filter.search === '' ? _.omit(this.filter, 'search') : this.filter).toPromise();
      if (data.result.length !== 0) {
        _.each(data.result, (value: any) => {
          value['isExpired'] = this.dashboardService.checkExpired(value.expiredDate, new Date());
          value['selected'] = false;
        });
      }
      this.positions = data.result;
      this.meta = data.meta;
      this.tableLoading = false;
      this.positionLoading = false;
    } catch (err) {
      this.tableLoading = false;
      this.positionLoading = false;
    }
  }


  // 删除职位
  async deletePosition(id: string) {
    try {
      await this.companyPositionService.destroy(localStorage.getItem('company'), id).toPromise();
      let index = _.findIndex(this.positions, {id: id});
      if (index !== -1) {
        this.positions.splice(index, 1);
        if (index !== -1) {
          this.positions.splice(index, 1);
          if (this.positions.length === 0 && this.filter.page - 1 > 0) {
            this.filter.page -= 1;
          }
        }
      }
      this.toasterService.pop('success', '', this.translate.instant('message.delete_success_msg'));
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('message.delete_error_msg'));
    }
  }


  // 下线职位
  async downlinePosition(id: any) {
    try {
      await this.companyPositionService.updatePosition(localStorage.getItem('company'), id, {active: false}).toPromise();
      this.positionTab(1);
      this.toasterService.pop('success', '', this.translate.instant('message.downline_success_msg'));
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('message.downline_error_msg'));
    }
  }

  async showChart(index: string): Promise<any> {

    try {
      this.positions[index]['selected'] = !this.positions[index]['selected'];
      let data = await this.companyPositionService.getChart(this.positions[index].id).toPromise();
      this.chartLoading = true;
      this.positions[index]['candidateNum'] = data.totalCandidates;
      this.positions[index]['educationChartLabels'] = [];
      this.positions[index]['educationChartData'] = [];
      this.positions[index]['experienceChartData'] = [];
      this.positions[index]['experienceChartLabels'] = [];
      this.positions[index]['skillChartLabels'] = [];
      this.positions[index]['skillChartData'] = [];
      this.positions[index]['schoolChartData'] = [];
      this.positions[index]['schoolChartLabels'] = [];
      this.positions[index]['subjectChartData'] = [];
      this.positions[index]['subjectChartLabels'] = [];

      _.each(data.educationLevels, (value: any) => {
        this.positions[index]['educationChartLabels'].push(value.name);

        this.positions[index]['educationChartData'].push(value.value);
      });

      _.each(data.yearOfExperience, (value: any) => {
        this.positions[index]['experienceChartData'].push(value.value);
        this.positions[index]['experienceChartLabels'].push(value.name);
      });

      if (data.skills.length > 0) {
        _.each(data.skills, (value: any, key: number) => {
          if (key <= 7) {
            this.positions[index]['skillChartData'].push(value.sum);
            this.positions[index]['skillChartLabels'].push(value.name);
          }
        });
        this.isSkill = true;
      } else {
        this.isSkill = false;
      }


      if (data.school.length > 0) {
        _.each(data.school, (value: any, key: any) => {
          if (key <= 7) {
            this.positions[index]['schoolChartData'].push(value.sum);
            this.positions[index]['schoolChartLabels'].push(value.name);
          }
        });
        this.isSchool = true;
      } else {
        this.isSchool = false;
      }

      if (data.subject.length > 0) {
        _.each(data.subject, (value: any, key: number) => {
          if (key <= 7) {
            this.positions[index]['subjectChartData'].push(value.sum);
            this.positions[index]['subjectChartLabels'].push(value.name);
          }
        });
        this.isSubject = true;
      } else {
        this.isSubject = false;
      }
      this.chartLoading = false;
    } catch (err) {
      this.chartLoading = false;
    }
  }

  postPosition() {
    if (this.enterprise.positionQuota === 0) {
      this.toasterService.pop('error', '', this.translate.instant('enterprise.postPosition'));
    } else {
      this.router.navigate(['/company', localStorage.getItem('company'), 'positions_create']);
    }
  }

}
