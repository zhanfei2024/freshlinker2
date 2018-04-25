import {Component, ViewContainerRef, OnInit, AfterViewChecked} from '@angular/core';
import {IPosition, PositionService, IMeta} from "../../position/position.service";
import {IFilter} from "../../post/post.service";
import {UserService, IUser} from "../user.service";
import * as _ from 'lodash';
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './user.applied.position.component.html',
})
export class UserAppliedPositionComponent implements OnInit,AfterViewChecked {
  public positions: IPosition[] = [];
  public tableLoading: boolean = false;
  public meta: IMeta = {pagination: {}};
  public changeLoading: boolean;
  public positionLoading: boolean = false;
  public currentDate: Date = new Date;
  public user: IUser;
  public filter: IFilter = {
    page: 1,
    limit: 10,
    userId: null,
  };

  constructor(private positionService: PositionService,
              private seoService: SeoService,
              private translate: TranslateService,
              private userService: UserService) {
  }
  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('user.profile.applied_position'),this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.readUser();
  }

  changeTab() {
    this.changeLoading = true;
    this.positions = [];
    this.positionLoading = true;
    this.filter.search = '';
    setTimeout(()=>{
      this.changeLoading = false;
    },1000);
  }

  async readUser() {
    try {
      let data = await this.userService.find({}).toPromise();
      this.user = data;
      this.filter.userId = this.user.id;
      this.CallPositionServer();

    } catch (err) {
    }
  }

  searchPosition() {
    this.positions = [];
    this.changeLoading = true;
    this.positionLoading = true;
    setTimeout(()=>{
      this.changeLoading = false;
    },1000);
    this.CallPositionServer();
  }

  //加载分页
  async changePage(event: any) {
    this.filter.page = event.page;
    this.filter.limit = event.itemsPerPage;
    this.CallPositionServer();
  }

  //获取分页数据
  async CallPositionServer(): Promise<any> {
    try {
      this.positionLoading = true;
      let data = await this.positionService.getByUserAppliedPosition(this.filter.search === '' ? _.omit(this.filter, 'search') : this.filter).toPromise();
      this.meta = data.meta;
      this.positions = [];
      if (data.result.length !== 0) {
        _.each(data.result, (value: any) => {
          value['isExpired'] = this.userService.checkExpired(value.position.expiredDate, this.currentDate);
          if (value.position.active && !value['isExpired']) {
            let index = _.findIndex(this.positions, {id: value.id});
            if (index === -1) {
              switch (value.candidateStatus.name) {
                case 'unprocessed':
                  value.candidateStatus.name = 'position.unprocessed';
                  break;
                case 'shortlist':
                  value.candidateStatus.name = 'company.communication_resume';
                  break;
                case 'not-suitable':
                  value.candidateStatus.name = 'position.not-suitable';
                  break;
                case 'complete':
                  value.candidateStatus.name = 'position.complete';
                  break;
                case 'success':
                  value.candidateStatus.name = 'position.success';
                  break;
              }
              this.positions.push(value);
            }
          }
        });
      }else {
        this.positions = data.result;
      }
        this.positionLoading = false;
    } catch (err) {
      this.positionLoading = false;
    }
  }
}
