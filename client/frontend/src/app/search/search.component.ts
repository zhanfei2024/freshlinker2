import {Component, OnInit} from '@angular/core';
import {PositionService, ISkill, IPosition, IJobNature} from '../position/position.service';
import {Router, ActivatedRoute} from "@angular/router";
import {ICompany} from "../company/service/company.service";
import {ISearch, searchService} from "./search.service";
import {IPositionCategory, PositionCategoryService} from "../position_category/position_category.service";
import {IPost, PostService} from "../post/post.service";
import {IEducationLevel, EducationLevelService} from "../../common/service/education_level.service";
import {ILocation, LocationService} from "../../common/service/location.service";
import * as _ from "lodash";
import {HotCompanyService} from "../hot_company/hot_company.service";
import {Location} from '@angular/common';
import {Observable} from "rxjs";
import {TypeaheadMatch} from "ngx-bootstrap";
import {URLSearchParams} from "@angular/http";

interface IRange {
  minMonthValue?: number;
  maxMonthValue?: number;
  floor?: number;
  ceil?: number;
  step?: number;
  minRange?: number;
  maxRange?: number;
  options?: any;
}

export interface ISearchShow {
  positionText: boolean,
  category: boolean,
  salary: boolean,
  education: boolean,
  location: boolean,
  experience: boolean,
  employment: boolean,
  jobNature: boolean,
  type: boolean
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})


export class searchComponent implements OnInit {
  public val: number;
  public hotTags: ISkill[] = [];
  public positions: IPosition[];
  public companies: ICompany[];
  public selected = undefined;
  public searchIndex: number = 1;
  public filter: ISearch = {};
  public category: IPositionCategory;
  public returnArticles: IPost[] = [];
  public rangeValues: number[] = [0, 100000];

  // search
  public searchShowMore: boolean = false;
  public loading: boolean;

  // experience
  public experience: IRange;

  // education
  public defaultEducationLevelIds: any = [];
  public selectedEducationLevel: any = [];
  public educationLevel: IEducationLevel[];

  // location
  public defaultLocationIds: any = [];
  public selectedLocations: any = [];
  public locations: ILocation[] = [];

  // category
  public defaultPositionCategoryIds: any = [];
  public selectedPositionCategories: any = [];
  public positionCategories: IPositionCategory[] = [];
  public opendedItems: any;

  // IJobNature
  public jobNatures: IJobNature[];
  public selectedJobNature: IJobNature;

  // type
  public positionType: string[] = [];
  public index: number = 1;
  public searchShow: ISearchShow = {
    positionText: false,
    category: false,
    salary: false,
    education: false,
    location: false,
    experience: false,
    employment: false,
    jobNature: false,
    type: false
  };

  public asyncSelected: string;
  public company_query: string;
  public article_query: string;
  public typeaheadLoading: boolean;
  public typeaheadNoResults: boolean;
  public dataSource: Observable<any>;
  public statesComplex: any[];

  constructor(private positionService: PositionService,
              private positionCategoryService: PositionCategoryService,
              private searchService: searchService,
              private postService: PostService,
              private locationService: LocationService,
              private hotCompanyService: HotCompanyService,
              private location: Location,
              private route: ActivatedRoute,
              private educationLevelService: EducationLevelService,
              private router: Router,) {

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (queryParams)=>{
          switch (location.pathname) {
            case '/search-position':
              this.index = 1;
              this.asyncSelected = queryParams['search'];
              break;
            case '/search-article':
              this.index = 2;
              break;
            case '/hot_company':
              this.index = 3;
              break;
          }

      }
    );



    this.reloadHotTags();
    this.positionType = ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Others'];
    this.readPositionCategory();
    this.readEducationLeve();
    this.readJobNatures();
    this.readLocation();
    this.reloadPosition();
    this.initFilter();
    this.dataSource = Observable
      .create((observer: any) => {
        // Runs on every search
        observer.next(this.asyncSelected);
      })
      .mergeMap((token: string) => this.getStatesAsObservable(token));

  }

  public getStatesAsObservable(token: string): Observable<any> {
    let query = new RegExp(token, 'ig');
    return Observable.of(
      this.statesComplex.filter((state: any) => {
        return query.test(state.name);
      })
    );
  }

  public changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  public changeTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
  }

  public typeaheadOnSelect(e: TypeaheadMatch): void {
    this.filter.search = e.value;
  }

  handleChange(e) {
    this.filter.minSalary = e.values[0];
    this.filter.maxSalary = e.values[1];
  }

  changeValue(e) {
    this.filter.experience = e.value;
  }

  //获取热门标签
  async reloadPosition(): Promise<any> {
    try {
      let data = await this.positionService.get().toPromise();
      this.statesComplex = data.result;
    } catch (err) {
    }
  }

  //获取热门标签
  async reloadHotTags(): Promise<any> {
    try {
      let data = await this.positionService.getTags({type: "PostTag", limit: 5}).toPromise();
      this.hotTags = data.result;
    } catch (err) {
    }
  }

  //获取职位类型
  async readPositionCategory(): Promise<any> {
    try {
      let data = await this.positionCategoryService.getPositionCategory({}).toPromise();
      this.positionCategories = data.result;
      this.setParent(this.positionCategories, null);
      this.setSelectedItems(this.positionCategories, null, this.defaultPositionCategoryIds, this.selectedPositionCategories);
    } catch (err) {
    }
  }

  //获取地区类型
  async readLocation(): Promise<any> {
    try {
      let data = await this.locationService.getLocationTree({}).toPromise();
      this.locations = data.result;
      this.setParent(this.locations, null);
      this.setSelectedItems(this.locations, null, this.defaultLocationIds, this.selectedLocations);
    } catch (err) {
    }
  }

  //获取教育水平
  async readEducationLeve(): Promise<any> {
    try {
      let data = await this.educationLevelService.get({}).toPromise();
      this.educationLevel = data.result;
      this.setParent(this.educationLevel, null);
      this.setSelectedItems(this.educationLevel, null, this.defaultEducationLevelIds, this.selectedEducationLevel);
    } catch (err) {
    }
  }

  //获取公司
  async readCompany(): Promise<any> {
    try {
      let data = await this.hotCompanyService.get({}).toPromise();
      this.companies = data.result;
    } catch (err) {
    }
  }

  //獲取職位性質
  async readJobNatures(): Promise<any> {
    try {
      let data = await this.positionService.getjobNatures({}).toPromise();
      this.jobNatures = data.result;
    } catch (err) {
    }
  }


  initFilter() {
    this.route.queryParams.subscribe(
      (queryParams) => {
        _.each(['search', 'salaryType', 'educationLevelIds', 'categoryIds', 'type', 'locationIds', 'tags'], (val: string) => {
          // search text category location education
          if (!_.isUndefined(queryParams[val])) {
            this.filter[val] = queryParams[val];
            if (this.location.path() === '/articles/article-search') this.filter.search = '';
            if (!_.isUndefined(queryParams['categoryIds'])) {
              this.defaultPositionCategoryIds = queryParams['categoryIds'];
            }
            if (!_.isUndefined(queryParams['locationIds'])) this.defaultLocationIds = queryParams['locationIds'];
            if (!_.isUndefined(queryParams['educationLevelIds'])) this.defaultEducationLevelIds = queryParams['educationLevelIds'];

            if (!_.isUndefined(queryParams['type'])) this.filter.type = _.capitalize(queryParams['type']);
            if (!_.isUndefined(queryParams['search']) && queryParams['tags']) delete queryParams['search'];
            if (!_.isUndefined(queryParams['tags']) && this.searchIndex === 1) this.filter.search = queryParams['tags'];
          }

          if (!_.isArray(queryParams['categoryIds']) && !_.isUndefined(queryParams['categoryIds'])) {
            this.defaultPositionCategoryIds = [queryParams['categoryIds']];
          }
          if (!_.isArray(queryParams['locationIds']) && !_.isUndefined(queryParams['locationIds'])) {
            this.defaultLocationIds = [this.route.params['locationIds']];
          }

          if (!_.isArray(queryParams['educationLevelIds']) && !_.isUndefined(queryParams['educationLevelIds'])) {
            this.defaultEducationLevelIds = [queryParams['educationLevelIds']];
          }
        });
        _.each(['companyId', 'minSalary', 'maxSalary', 'experience'], (val: string) => {
          if (!_.isUndefined(queryParams[val])) this.filter[val] = parseInt(queryParams[val]);
        });

        if (_.isUndefined(this.filter.experience)) this.filter.experience = 0;
        if (_.isUndefined(this.filter.salaryType)) this.filter.salaryType = 'monthly';
        if (_.isUndefined(this.filter.minSalary)) this.filter.minSalary = 0;
        if (_.isUndefined(this.filter.maxSalary)) this.filter.maxSalary = this.filter.salaryType === 'monthly' ? 100000 : 500;

        if (!_.isUndefined(queryParams['jobNatureId'])) {
          this.selectJobNature(queryParams['jobNatureId']);
          this.filter.jobNatureId = parseInt(queryParams['jobNatureId']);
        }
      });
  }


  //獲取選中職位性質
  async selectJobNature(id: string): Promise<any> {
    try {
      let data = await this.positionService.findJobNature(id).toPromise();
      this.selectedJobNature = data.result;
      this.filter.jobNatureId = this.selectedJobNature.id;
    } catch (err) {
    }
  }


  initFilterSearch() {
    if (_.isUndefined(this.filter.experience)) {
      this.filter.experience = 0;
      let addressUrl = location.search.slice(1);
      let searchParams = new URLSearchParams(addressUrl);
      searchParams.set('experience',null);
    }
    if (_.isUndefined(this.filter.salaryType)) {
      this.filter.salaryType = 'monthly';
      let addressUrl = location.search.slice(1);
      let searchParams = new URLSearchParams(addressUrl);
      searchParams.set('salaryType',null);
    }
    if (_.isUndefined(this.filter.minSalary)) {
      this.filter.minSalary = 0;
      let addressUrl = location.search.slice(1);
      let searchParams = new URLSearchParams(addressUrl);
      searchParams.set('minSalary',null);
    }
    if (_.isUndefined(this.filter.maxSalary)) {
      this.filter.maxSalary = this.filter.salaryType === 'monthly' ? 100000 : 500;
      let addressUrl = location.search.slice(1);
      let searchParams = new URLSearchParams(addressUrl);
      searchParams.set('maxSalary',null);
    }
  }

  switchSalaryType(type: string) {
    this.filter.salaryType = type;
    this.initSalaryRange(type);
  }

  initSalaryRange(type: string) {
    this.filter.minSalary = 0;
    this.filter.maxSalary = type === 'monthly' ? 100000 : 500;
  }

  // home search position
  searchPosition(type: string) {
    if (!_.isUndefined(this.route.params['tags'])) {
      delete this.route.params['tags'];
      delete this.filter.tags;
    }
    if(this.selectedPositionCategories.length > 0) this.filter.categoryIds = _.map(this.selectedPositionCategories, 'id');
    if(this.selectedPositionCategories.length === 0) this.filter.categoryIds = [];
    if(this.selectedLocations.length > 0) this.filter.locationIds = _.map(this.selectedLocations, 'id');
    if(this.selectedLocations.length === 0) this.filter.locationIds = [];
    if(this.selectedEducationLevel.length > 0) this.filter.educationLevelIds = _.map(this.selectedEducationLevel, 'id');
    if (!_.isUndefined(this.filter.type)) this.filter.type = this.filter.type.toLocaleLowerCase();
    if (!_.isUndefined(this.selectedJobNature)) this.filter.jobNatureId = this.selectedJobNature.id;
    if (this.filter.minSalary === 0 && (this.filter.maxSalary === 500 || this.filter.maxSalary === 100000)) {
      delete this.filter.salaryType;
      delete this.filter.maxSalary;
    }
    if (!_.isUndefined(this.asyncSelected)) this.filter.search = this.asyncSelected;
    if (this.filter.minSalary === 0) delete this.filter.minSalary;
    if (this.filter.experience === 0) delete this.filter.experience;
    this.searchService.searchType(type);
    this.router.navigate(['/search-position'], {queryParams: this.filter});
    this.initFilterSearch();
  }


//  search article refresh
  async getArticle(val: string) {
    try {
      let data = await this.postService.get({'search': val}).toPromise();
      this.returnArticles = data.result;
      _.each(this.returnArticles, (value: any) => {
        this.postService.getUserName(value);
      });
      return this.returnArticles;
    } catch (err) {
    }
  }


  searchToggle(category: string) {
    for (let key in this.searchShow) {
      if (category === key) {
        this.searchShow[key] = !this.searchShow[key];
        this.searchShowMore = true;
      } else {
        this.searchShow[key] = false;
      }
      if (category === 'toggleHide') {
        this.searchShow[key] = false;
        this.searchShowMore = true;
      }
      if (category === 'search') {
        this.searchShowMore = true;
      }
      if (category === 'all') {
        this.searchShowMore = !this.searchShowMore;
        this.searchShow['search'] = false;
        this.searchShow['type'] = false;
        this.searchShow['salaryType'] = false;
        this.searchShow['experience'] = false;
        this.searchShow['location'] = false;
        this.searchShow['category'] = false;
        this.searchShow['education'] = false;
        this.searchShow['jobNature'] = false;
      }
    }
  }


  setParent(children: any, parent: any) {
    _.forEach(children, (child: any) => {
      child.parent = parent;
      child.isShowChilren = false;
      if (typeof child.children !== 'undefined') {
        this.setParent(child.children, child);
      } else {
        child.children = [];
      }
    });
  };

  setSelectedItems(children: any, parent: any, selectedItemIds: any[], selectedItems: any[]) {
    if (!_.isUndefined(selectedItemIds)) {
      _.forEach(children, (child: any) => {
        if (selectedItemIds.indexOf(child.id.toString()) !== -1) {
          child.selected = true;
          selectedItems.push(child);
        }
        if (typeof child.children !== 'undefined') {
          this.setSelectedItems(child.children, child, selectedItemIds, selectedItems);
        }
      });
    }
  };


  toggleItem(item: any, category: IPositionCategory[]): void {
    this.opendedItems = [];
    _.each(category, (value: any, index: number) => {
      if (value.parent === null) {
        this.opendedItems.push(value);
      }
    });

    if (item) {
      if (item.isShowChildren) {
        item.isShowChildren = false;
        return;
      }
      for (let i = this.opendedItems.length - 1; i >= 0; i--) {
        if (item.id === this.opendedItems[i].id) {
          this.opendedItems[i].isShowChildren = true;
        } else {
          this.opendedItems[i].isShowChildren = false;
        }
      }

      let parent = item;
      while (parent !== null) {
        parent.isShowChildren = true;
        this.opendedItems.push(parent);
        parent = parent.parent;
      }
    }
  };

  // get selected data
  addSelectedCategoryItem($event, data: any) {
    this.selectedPositionCategories = this.searchService.addSelectedItem($event, data, this.selectedPositionCategories, 5);
  }

  addSelectedLocationItem($event, data: any) {
    this.selectedLocations = this.searchService.addSelectedItem($event, data, this.selectedLocations, 5);
  }

  addSelectedEducationItem($event, data: any) {
    this.selectedEducationLevel = this.searchService.addSelectedItem($event, data, this.selectedEducationLevel, 3);
  }


  search(type: string, name: string) {
    switch (type) {
      case 'company':
        this.router.navigate([`/hot_company`], {queryParams: {search: name}});
        break;
      case 'article':
        this.router.navigate([`/search-article`], {queryParams: {search: name}});
        break;
    }
  }

  searchTag(type: string, name: string) {
    switch (type) {
      case 'search':
        this.router.navigate([`/search-article`], {queryParams: {search: name}});
        break;
      case 'tags':
        this.router.navigate([`/search-article`], {queryParams: {tags: name}});
        break;
    }

  }

}
