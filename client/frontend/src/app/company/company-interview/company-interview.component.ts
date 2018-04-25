import {Component, OnInit, OnDestroy, AfterViewChecked} from '@angular/core';
import {ITab, IMeta, IFilter} from "../../position/position.service";
import {IEnterprise} from "../../enterprise/enterprise.service";
import {ICountry} from "../../user/country.service";
import {ICompany, CompanyService} from "../service/company.service";
import {CandidatePositionService} from "../service/company-interview.serivce";
import {CompanyPositionService, IPosition} from "../service/company-position.service";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import * as _ from "lodash";
import {Router} from "@angular/router";
import {SeoService} from "../../../common/global/seo";


@Component({
  templateUrl: './company-interview.component.html',
})
export class CompanyInterviewComponent implements OnInit, AfterViewChecked, OnDestroy {
  public company: ICompany;
  public country: ICountry;
  public enterprise: IEnterprise[] = [];
  public candidates: any = [];
  public candidateStatus: ITab[] = [];
  public positionName: string[] = [];
  public positions: IPosition[] = [];
  public interviewIndex: number = 1;
  public positionIndex: number = 1;
  public companyId: string;
  public activatedPositionId: string;
  public activatedId: string;
  public candidateNum: number = 0;
  public currentDate: Date = new Date;
  public changeTabLoading: boolean = false;
  public candidateLoading: boolean = true;
  public tableLoading: boolean = false;
  public positionLoading: boolean = false;
  public positionPageLoading: boolean = false;
  public meta: IMeta = {pagination: {}};
  public candidateMeta: IMeta = {pagination: {}};
  public pictureMeta: IMeta = {pagination: {}};
  public pageNum: IFilter = {
    page: 1,
    limit: 5,
    search: '',
  };

  public filter: IFilter = {
    page: 1,
    limit: 5,
    positionId: '1',
  };


  constructor(private candidatePositionService: CandidatePositionService,
              private companyPositionService: CompanyPositionService,
              private toasterService: ToasterService,
              private router: Router,
              private translate: TranslateService,
              private seoService: SeoService,
              private companyService: CompanyService) {

  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('enterprise.resume_management'),this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.candidateStatus = [
      {
        id: 1,
        name: 'company.untreated_resume'
      },
      {
        id: 2,
        name: 'company.communication_resume'
      },
      {
        id: 5,
        name: 'company.success_resume'
      },
      {
        id: 4,
        name: 'company.finish_resume'
      },
      {
        id: 3,
        name: 'company.improper_resume'
      }
    ];
    this.positionLoading = true;


    this.readEnterprise();
    this.readCandidateNum(localStorage.getItem('company'));
    this.jobServer();
    this.candidatesServer();
    if (localStorage.getItem('role') === 'enterprise') {
      this.activatedPositionId = localStorage.getItem('activatedPositionId');
      this.activatedId = localStorage.getItem('activatedId');
      let commentStateId = localStorage.getItem('commentState')
      setTimeout(() => {
        if (commentStateId) {
          this.changeTab(localStorage.getItem('commentState'), 1);
        } else if (this.activatedPositionId && this.activatedId) {
          this.changeTab(this.activatedPositionId, _.toNumber(this.activatedId));
        }
      }, 400)
    }

  }
  ngOnDestroy(): void {
    localStorage.removeItem('commentState')
  }
  //加载企业
  async readEnterprise(): Promise<any> {
    try {
      let data = await this.companyService.getEnterprise({}).toPromise();
      this.enterprise = data.result;
    } catch (err) {
    }
  }

  //加载简历数量
  async readCandidateNum(id: string): Promise<any> {
    try {
      let data = await this.candidatePositionService.get(id).toPromise();
      this.candidateNum = data.result.length;
    } catch (err) {
    }
  }

  changeTab(positionId: string, id: number) {
    this.filter.candidateStatusId = id;
    this.interviewIndex = id;
    this.filter.positionId = positionId;
    this.candidates = [];
    // this.filter.search = '';
    this.changeTabLoading = true;
    setTimeout(() => {
      this.changeTabLoading = false;
    }, 400);
    this.candidatesServer();
    localStorage.setItem('activatedPositionId', positionId);
    localStorage.setItem('activatedId', _.toString(id));
  }

  searchInterview() {
    this.candidates = [];
    setTimeout(() => {
      this.changeTabLoading = false;
    }, 1000);
    this.jobServer();
  }

  //加载分页
  async changePage(event: any) {
    this.pageNum.page = event.page;
    this.pageNum.limit = event.itemsPerPage;
    await this.jobServer();
  }

  async jobServer(): Promise<any> {
    try {
      this.positionPageLoading = true;
      let data = await this.companyPositionService.getEnterprisePositionByCompany(localStorage.getItem('company'), this.pageNum.search === '' ? _.omit(this.pageNum, 'search') : this.pageNum).toPromise();
      if (data.result.length !== 0) {
        this.positions = data.result;
        this.changeTab(this.positions[0]['id'], 1);
      }
      this.meta = data.meta;
      this.positionLoading = false;
      this.positionPageLoading = false;
    } catch (err) {
      this.positionPageLoading = false;
    }
  }

  //加载分页
  async changeCandidatesPage(event: any) {
    this.filter.page = event.page;
    this.filter.limit = event.itemsPerPage;
    await this.candidatesServer();
  }

  async candidatesServer(): Promise<any> {
    try {
      this.candidateLoading = true;
      let data = await this.candidatePositionService.get(localStorage.getItem('company'), this.filter).toPromise();
      if (data.result.length !== 0) {
        _.each(data.result, (val:any) => {
          val.userName = this.candidatePositionService.getUserName(val);
        });
      }
      this.candidates = data.result;
      this.candidateMeta = data.meta;
        this.candidateLoading = false;
    } catch (err) {
      this.candidateLoading = false;
    }
  }

  // interview && notSuitableInterview
  async changeInterviewStatus(id: string, interviewStatus: number) {
    try {
      await this.candidatePositionService.update(localStorage.getItem('company'), id, {candidateStatusId: interviewStatus}).toPromise();
      switch (interviewStatus) {
        case 1:
          this.changeTab(this.filter.positionId, 1);
          break;
        case 2:
          this.changeTab(this.filter.positionId, 2);
          break;
        case 3:
          this.changeTab(this.filter.positionId, 3);
          break;
        case 4:
          this.changeTab(this.filter.positionId, 4);
          break;
        case 5:
          this.changeTab(this.filter.positionId, 5);
          break;
      }
      this.toasterService.pop('success', '', this.translate.instant('message.resume_success_msg'));
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('message.resume_error_msg'));
    }

  }


  postPosition() {
    if (this.enterprise['positionQuota'] === 0) {
      this.toasterService.pop('error', '', this.translate.instant('enterprise.postPosition'));
    } else {
      this.router.navigate(['/company', localStorage.getItem('company'), 'positions_create']);
    }
  }

  showContent(index: number) {
    this.candidates[index]['selected'] = !this.candidates[index]['selected'];
  }

}
