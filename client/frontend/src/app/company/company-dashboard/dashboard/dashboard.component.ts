import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import * as moment from "moment";
import {ToasterService} from 'angular2-toaster';
import {TranslateService} from '@ngx-translate/core';
import {DashboardService} from '../company-dashboard.service';
import {IEnterprise} from '../../../enterprise/enterprise.service';
import {UserService} from '../../../user/user.service';
import {IPosition, IFilter, IMeta, IChart, ITab} from '../../../position/position.service';
import {ICompany, IPicture, CompanyService} from '../../service/company.service';
import {NgxGalleryOptions, NgxGalleryImage} from 'ngx-gallery';
import {SeoService} from '../../../../common/global/seo';


@Component({
  templateUrl: './dashboard.component.html',
})
export class CompanyDashboardComponent implements OnInit, AfterViewChecked{
  public positions: IPosition[] = [];
  public itemsByPage = 3;
  public company: ICompany = {};
  public companyId: string;
  public currentDate: Date;
  public enterprise: IEnterprise = {};
  public candidateNum = 0;
  public plan: any;
  public total: string;
  public filter: IFilter = {
    limit: 5,
    page: 1,
    candidateStatusId: 1
  };
  public meta: IMeta = {pagination: {}};

  // educationChart
  public educationChartLabels: IChart[] = [];
  public educationChartData: IChart[] = [];

  // experienceChart
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
  public chartIndex: number;
  public chartTabs: ITab[] = [];

  // picture
  public pictures: any = [];
  public loadPictures: IPicture[] = [];

  public isSkill = false;
  public isSubject = false;
  public isSchool = false;

  public descriptionShow = false;
  public dashboardLoading = false;
  public pictureLoading = false;
  public tableLoading = false;
  public pieChartType = 'pie';
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

  public polarAreaLegend = true;
  public galleryOptions: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];

  constructor(private route: ActivatedRoute,
              private toasterService: ToasterService,
              private dashboardService: DashboardService,
              private router: Router,
              private translate: TranslateService,
              private seoService: SeoService,
              private userService: UserService,
              private companyService: CompanyService) {

  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('user.profile.user_enterprise'),this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.chartTabs = [
      {
        id: 1,
        name: 'user.profile.experience'
      },
      {
        id: 2,
        name: 'user.profile.education'
      },
      {
        id: 3,
        name: 'user.profile.skill'
      },
      {
        id: 4,
        name: 'user.profile.school'
      },
      {
        id: 5,
        name: 'user.profile.subject'
      }
    ];

    this.route.data.subscribe((data: {dashboardFindResolve: any}) => {
      this.company = data.dashboardFindResolve;
      this.companyId = this.company.id;
      localStorage.setItem('company', this.companyId);
      this.readPicture();
    });
    this.currentDate = new Date();
    this.readEnterprise();
    this.changeTab(1);
    this.callServerPosition();
    this.galleryOptions = [
      { 'image': false, 'height': '100px' },
      { 'breakpoint': 1920, 'width': '100%'}
    ];

  }


  // 加载图片
  async readPicture(): Promise<any> {
    try {
      this.pictureLoading = true;
      const data = await this.companyService.getCompanyPictures(this.companyId).toPromise();
      this.pictures = data;
      const arr = [];
      _.each(this.pictures, (value:any) => {
        arr.push({small: value.url['160'], medium: value.url['1024'], big: value.url['1024']});
      });
      this.galleryImages = arr;
      this.pictureLoading = false;
    } catch (err) {
      this.pictureLoading = false;
    }
  }

  // 加载企业
  async readEnterprise(): Promise<any> {
    try {
      this.dashboardLoading = false;
      const data = await this.companyService.getEnterprise({}).toPromise();
      this.enterprise = data.result;
      this.total = this.enterprise.balance;
      this.dashboardLoading = false;
      let positionExpiredDate = +moment(this.enterprise['positionExpiredDate']).format('YYYY-MM-DD').replace(/-/g, '')
      let dateNow = +moment(new Date()).format('YYYY-MM-DD').replace(/-/g, '');
      if (dateNow > positionExpiredDate) {
        this.enterprise.positionQuota = 0;
      }
    } catch (err) {

    }
  }

  public postPosition() {
    if (this.enterprise.positionQuota === 0) {
      this.toasterService.pop('error', '', this.translate.instant('enterprise.postPosition'));
    } else {
      this.router.navigate(['/company', this.companyId, 'positions_create']);
    }
  }

  async changeTab(tabId: number) {
    this.chartIndex = tabId;
    this.chartLoading = true;
    try {
      const data = await this.dashboardService.getChart(this.companyId).toPromise();
      this.candidateNum = data.result.totalCandidates;
      this.educationChartLabels = [];
      this.educationChartData = [];
      this.experienceChartData = [];
      this.experienceChartLabels = [];
      this.skillChartLabels = [];
      this.skillChartData = [];
      this.schoolChartData = [];
      this.schoolChartLabels = [];
      this.subjectChartData = [];
      this.subjectChartLabels = [];
      switch (this.chartIndex) {
        case 1:
          _.each(data.result.yearOfExperience, (value: any) => {
            this.experienceChartData.push(value.value);
            this.experienceChartLabels.push(value.name);
          });
          break;
        case 2:
          _.each(data.result.educationLevels, (value: any) => {
            this.educationChartLabels.push(value.name);
            this.educationChartData.push(value.value);
          });
          break;

        case 3:
          if (data.result.skills.length > 0) {
            _.each(data.result.skills, (value: any, key: number) => {
              if (key <= 7) {
                this.skillChartData.push(value.sum);
                this.skillChartLabels.push(value.name);
              }

            });
            this.isSkill = true;
          } else {
            this.isSkill = false;
          }
          break;
        case 4:
          if (data.result.school.length > 0) {
            _.each(data.result.school, (value: any, key: any) => {
              if (key <= 7) {
                this.schoolChartData.push(value.sum);
                this.schoolChartLabels.push(value.name);
              }
            });
            this.isSchool = true;
          } else {
            this.isSchool = false;
          }
          break;
        case 5:
          if (data.result.subject.length > 0) {
            _.each(data.result.subject, (value: any, key: number) => {
              if (key <= 7) {
                this.subjectChartData.push(value.sum);
                this.subjectChartLabels.push(value.name);
              }
            });
            this.isSubject = true;
          } else {
            this.isSubject = false;
          }
      }

      this.chartLoading = false;

    } catch (err) {
      this.chartLoading = false;
    }
  }


  // 加载分页
  async changePage(event: any, id: number) {
    this.tableLoading = true;
    this.filter.page = event.page;
    this.filter.limit = event.itemsPerPage;
    await this.callServerPosition();
  }

  async callServerPosition(): Promise<any> {
    try {
      this.tableLoading = true;
      const data = await this.dashboardService.findCompanyPositions(this.companyId, this.filter).toPromise();
      this.meta = data.meta;
      if (data.result.length !== 0) {
        _.each(this.positions, (value: any) => {
          value['isExpired'] = this.userService.checkExpired(value.expiredDate, this.currentDate);
        });
      }
      this.positions = data.result;
      this.tableLoading = false;
    } catch (err) {
      this.tableLoading = false;
    }
  }


}
