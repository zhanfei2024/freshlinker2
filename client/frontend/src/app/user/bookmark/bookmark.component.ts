import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {IPosition, PositionService, IMeta} from "../../position/position.service";
import {IFilter} from "../../post/post.service";
import {UserService, IUser} from "../user.service";
import * as _ from 'lodash';
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './bookmark.component.html',
})
export class BookmarkComponent implements OnInit,AfterViewChecked {
  public positions: IPosition[] = [];
  public tableLoading: boolean = false;
  public meta: IMeta = {pagination: {}};
  public changeLoading: boolean = false;
  public positionLoading: boolean = false;
  public currentDate: Date = new Date;
  public user: IUser;
  public filter: IFilter = {
    page: 1,
    limit: 10,
  };

  constructor(private positionService: PositionService,
              private seoService: SeoService,
              private translate: TranslateService,
              private userService: UserService) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('user.profile.bookmark'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.CallBookMarkServer();
  }

  changeTab() {
    this.changeLoading = true;
    this.positions = [];
    this.positionLoading = true;
    this.filter.search = '';
    this.changeLoading = false;

  }

  searchPosition() {
    this.positions = [];
    this.changeLoading = true;
    this.positionLoading = true;
    setTimeout(() => {
      this.changeLoading = false;
    }, 1000);
    this.CallBookMarkServer();
  }

  //加载分页
  async changePage(event: any) {
    this.filter.page = event.page;
    this.filter.limit = event.itemsPerPage;
    this.CallBookMarkServer();
  }

  //获取分页数据
  async CallBookMarkServer(): Promise<any> {
    try {
      this.tableLoading = true;
      this.positionLoading = true;
      let data = await this.positionService.getBookMark(this.filter.search === '' ? _.omit(this.filter, 'search') : this.filter).toPromise();
      this.meta = data.meta;
      this.positions = [];
      if (data.result.length !== 0) {
        _.each(data.result, async(value: any) => {
          value['isExpired'] = this.userService.checkExpired(value.position.expiredDate, this.currentDate);
          if (value.position.active && !value['isExpired']) {
            let result = await this.readFindPosition(value.positionId);
            result.bookmarkStatus = true;
            this.positions.push(result);
          }
        });
      }
      setTimeout(() => {
        this.tableLoading = false;
        this.positionLoading = false;
      }, 500);
    } catch (err) {
      this.tableLoading = false;
      this.positionLoading = false;

    }
  }

  async readFindPosition(id: string): Promise<any> {
    try {
      let data = await this.positionService.find(id).toPromise();
      return Promise.resolve(data);
    } catch (err) {

    }
  }

  collectBookMark(positionId: string) {
    try {
      this.positionService.collectBookMark(positionId).toPromise();
      let index = _.findIndex(this.positions, {id: positionId});
      if (index !== -1) this.positions[index].bookmarkStatus = true;
    } catch (err) {

    }
  }

  removeCollectPosition(positionId: string) {
    try {
      this.positionService.removeBookMark(positionId).toPromise();
      let index = _.findIndex(this.positions, {id: positionId});
      if (index !== -1) this.positions[index].bookmarkStatus = false;
    } catch (err) {

    }
  }

}
