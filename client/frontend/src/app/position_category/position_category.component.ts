import {Component, OnInit, AfterViewChecked} from "@angular/core";
import {BreadcrumbService} from "../../common/breadcrumb/breadcrumb.service";
import {PositionCategoryService, IPositionCategory} from "./position_category.service";
import {PositionService, ISkill, IPosition} from "../position/position.service";
import {HomeService} from "../home/home.service";
import * as _ from "lodash";
import {ISearch, searchService} from "../search/search.service";
import {Router} from "@angular/router";
import {SeoService} from "../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './position_category.component.html',
})

export class PositionCategoryComponent implements OnInit,AfterViewChecked {
  public positionCategories: IPositionCategory[] = [];
  public hotPosition: IPosition[] = [];
  public hotTags: ISkill[] = [];
  public filter: ISearch = {};
  public positionLoading: boolean = false;
  public categoryLoading: boolean = false;
  public hotTagsLoading: boolean = false;

  constructor(private positionCategoryService: PositionCategoryService,
              private positionService: PositionService,
              private searchService: searchService,
              private router: Router,
              private homeService: HomeService,
              private seoService: SeoService,
              private translate: TranslateService,
              private breadcrumbService: BreadcrumbService) {
  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('search.search_position'),this.seoService.getTitleContent());
  }
  ngOnInit() {
    // 设置 breadcrumb
    this.breadcrumbService.clear();
    this.breadcrumbService.set({title: 'navbar.position_search', router: '/position_category'});
    this.readPositionCategory();
    this.readHotTags();
    this.reloadHotPosition();

  }

  //获取职位类型
  async readPositionCategory(): Promise<any> {
    try {
      this.categoryLoading = true;
      let data = await this.positionCategoryService.getPositionCategory().toPromise();
      this.positionCategories = data.result;
      this.categoryLoading = false;
    } catch (err) {
      this.categoryLoading = false;
    }
  }

  //获取热门标签
  async readHotTags(): Promise<any> {
    try {
      this.hotTagsLoading = true;
      let data = await this.positionService.getTags( {type:'PositionSkill', limit:10}).toPromise();
      this.hotTags = data.result;
      this.hotTagsLoading = false;
    } catch (err) {
      this.hotTagsLoading = false;
    }
  }

  // 获取 hotPosition
  async reloadHotPosition() {
    if (!_.isNull(localStorage.getItem('id_token'))) {
      this.obtainInvitationHotPosition();
      this.obtainInvitationPosition();
    } else {
      this.obtainHotPosition();
    }

  }

  //获取邀请热门职位
  async obtainInvitationHotPosition(): Promise<any> {
    this.positionLoading = true;
    try {
      let data = await this.homeService.getInvitation({'limit': 5}).toPromise();
      _.forEach(data.result, (val: IPosition)=> {
        let i = _.findIndex(this.hotPosition, {id: val.id});
        if (i === -1) {
          val['isJobInvitation'] = true;
          this.hotPosition.unshift(val);
        }
      })
      this.positionLoading = false;

    } catch (err) {
      this.positionLoading = false;
    }

  }

  //获取邀请职位
  async obtainInvitationPosition(): Promise<any> {
    this.positionLoading = true;
    try {
      let data = await this.positionService.get({'limit': 10}).toPromise();
      _.forEach(data.result, (item: IPosition)=> {
        let index = _.findIndex(this.hotPosition, {id: item.id});
        if (index === -1) {
          item['isJobInvitation'] = false;
          this.hotPosition.push(item);
        }
        this.positionLoading = false;
      });


    } catch (err) {
      this.positionLoading = false;
    }

  }

  //获取职位
  async obtainHotPosition(): Promise<any> {
    this.positionLoading = true;
    try {
      let data = await this.positionService.get({'limit': 10}).toPromise();
      this.hotPosition = data.result;
      this.positionLoading = false;
    } catch (err) {
      this.positionLoading = false;
    }
  }

  search(id: string) {
    this.filter.categoryIds = [id];
    this.router.navigate(['/search-position'],{queryParams:this.filter});
  }

  // search position by tags
  searchPosition(name: string) {
    this.searchService.searchType('tags');
    this.router.navigate(['/search-position'], {queryParams: {tags: name}});
  }


}
