import {Component, ViewChild, OnInit} from "@angular/core";
import {ModalDirective} from 'ngx-bootstrap';
import {BreadcrumbService} from '../../../common/breadcrumb/breadcrumb.service';
import {PositionService, IPosition, IFilter, ITab, IMeta, IPositionQuestion, IQuestion} from '../position.service';
import {Auth} from '../../auth/auth.service';
import {Router, ActivatedRoute} from '@angular/router';
import * as _ from "lodash";
import * as moment from "moment";
import {IPost, PostService} from "../../post/post.service";
import {UserService, IUser} from "../../user/user.service";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {SeoService} from "../../../common/global/seo";
import {searchService} from "../../search/search.service";
import {LocationService} from "../../../common/service/location.service";
import {UserPostService} from "../../user/user_article/user_article.service";
import {ChatService} from "../../../common/chat/chat.service";

@Component({
  templateUrl: './position-list.component.html',
})
export class PositionListComponent implements OnInit {
  public positions: IPosition[] = [];
  public firstPosition: IPosition;
  public user: IUser = {};
  public otherPositions: IPosition[] = [];
  public relatedPosts: IPost[] = [];
  public post: any = {
    positionAnswer: [],
    isCheckApply: false
  };
  public currentDate: Date = new Date;
  public positionId: string;
  public candidateNum: number = 0;
  public meta: IMeta = {pagination: {}};
  public pageNum: IFilter = {
    limit: 12,
    page: 1
  };
  public positionTab: ITab[] = [];
  public positionIndex: number = 1;
  public number: number = 1;
  public tableLoading: boolean = true;
  public parentLocations: string;
  public Loading: boolean = true;
  public positionLoading: boolean;
  public positionLoading2: boolean;
  public relatedLoading: boolean = false;
  public questionLoading: boolean = false;


  //educationChart
  public educationChartLabels: any = [];
  public educationChartData: any = [];
  public selftemptation: any = [];
  public category: any = [];

  //experienceChart
  public experienceChartLabels: any = [];
  public experienceChartData: any = [];

  public isLogin: boolean = false;
  public chartLoading: boolean = false;
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


  @ViewChild('childRemoveModal') public childRemoveModal: ModalDirective;
  @ViewChild('childApplyModal') public childApplyModal: ModalDirective;

  public constructor(private breadcrumbService: BreadcrumbService,
                     private positionService: PositionService,
                     private postService: PostService,
                     private userService: UserService,
                     private locationService: LocationService,
                     private toasterService: ToasterService,
                     private userPostService: UserPostService,
                     private seoService: SeoService,
                     private translate: TranslateService,
                     private searchService: searchService,
                     private activatedRoute: ActivatedRoute,
                     private auth: Auth,
                     private chatService: ChatService,
                     private router: Router) {

  }

  ngOnInit() {
    if (location.pathname === '/search-position') {
      this.activatedRoute.queryParams.subscribe(
        (queryParams) => {
          //加載搜索職位頁面數據
          this.pageNum.page = 1;
          if (!_.isUndefined(queryParams['search'])) this.pageNum.search = queryParams['search'];
          if (!_.isUndefined(queryParams['tags'])) this.pageNum.tags = queryParams['tags'];
          if (!_.isUndefined(queryParams['categoryIds'])) this.pageNum['categoryIds'] = queryParams['categoryIds'];
          if (!_.isUndefined(queryParams['salaryType'])) this.pageNum.salaryType = queryParams['salaryType'];
          if (!_.isUndefined(queryParams['minSalary'])) this.pageNum.minSalary = queryParams['minSalary'];
          if (!_.isUndefined(queryParams['maxSalary'])) this.pageNum.maxSalary = queryParams['maxSalary'];
          if (!_.isUndefined(queryParams['educationLevelIds'])) this.pageNum.educationLevelIds = queryParams['educationLevelIds'];
          if (!_.isUndefined(queryParams['experience'])) this.pageNum.experience = queryParams['experience'];
          if (!_.isUndefined(queryParams['type'])) this.pageNum.type = queryParams['type'];
          if (!_.isUndefined(queryParams['locationIds'])) this.pageNum.locationIds = queryParams['locationIds'];
          if (!_.isUndefined(queryParams['jobNatureId'])) this.pageNum.jobNatureId = queryParams['jobNatureId'];
          this.reloadPositions();
        }
      );
    } else {
      this.activatedRoute.params.subscribe(
        (params) => {
          if (!_.isUndefined(params['id'])) {
            //加載公司職位頁面數據
            this.pageNum.companyId = params['id'];
            this.reloadPositions();
          } else {
            //加載職位列表頁面數據
            this.reloadPositions();
          }
        }
      );
    }


    // position tab
    this.positionTab = [
      {
        id: 1,
        name: 'position.introduction'
      },
      {
        id: 2,
        name: 'position.related_news'
      }
    ];
  }

  //获取用户
  async readUser() {
    try {
      let data = await this.userService.find({}).toPromise();
      this.user = data;
    } catch (err) {
    }
  }

  changeTab(id: number) {
    this.Loading = true;
    this.positionIndex = id;
    if (this.positionIndex === 2) this.readCategory();
    this.Loading = false;
  }

  async reloadPositions(): Promise<any> {
    try {
      this.tableLoading = true;
      this.positionLoading = true;
      let data = await this.positionService.get(this.pageNum).toPromise();
      this.meta = data.meta;
      this.positions = data.result;
      _.forEach(this.positions, (value: IPosition) => {
        // save position
        value['bookmarkStatus'] = this.checkCollectPosition(value);
      });
      this.changePosition(0);
      this.tableLoading = false;
      this.positionLoading = false;
    } catch (err) {
      this.tableLoading = false;
      this.positionLoading = false;
    }
  }

  // search result
  public changePosition(index: number) {
    this.firstPosition = this.positions[index];
    this.seoService.setTitle(this.firstPosition.name);
    this.breadcrumbService.clear();
    this.breadcrumbService.set({title: 'position.position_list', router: '/position-list'});
    this.breadcrumbService.set({title: this.firstPosition.name, router: '/position-list'});
    this.reloadPositionClickNum(this.firstPosition.id);
    this.number = this.number + 1;
    if (this.number > 1) {
      this.firstPosition.view = this.firstPosition.view + 1;
    }
    if (this.firstPosition['locations'] !== null) {
      this.reloadFinLocations(this.firstPosition['locations'].parentId);
    }
    _.each(this.firstPosition.categories, async (result) => {
      result['categoriesName'] = await this.readPositionCategroy(result);
    });
    if (!_.isUndefined(this.firstPosition.temptation) && !_.isNull(this.firstPosition.temptation)) {
      this.selftemptation = this.firstPosition.temptation.split(',');
    }
    if (_.isUndefined(this.firstPosition.positionQuestion)) this.firstPosition.positionQuestion = [];
    if (_.isUndefined(this.firstPosition.positionAnswer)) this.firstPosition.positionAnswer = [];
    if (this.auth.isAuthenticated()) {
      this.reloadUserSkills();
    } else {
      _.forEach(this.firstPosition.skills, (value: any) => {
        value['match'] = false;
      });
    }
    this.changeTab(1);
    this.checkApplied();
    this.reloadOtherPosition(this.firstPosition);
    this.getChart(this.firstPosition.id);
  }

  async reloadFinLocations(id: string): Promise<any> {
    try {
      let data = await this.locationService.find(id).toPromise();
      this.parentLocations = data.name;
    } catch (err) {
    }
  }


  async reloadUserSkills(): Promise<any> {
    try {
      let skill = await this.userService.getComparedSkill(this.firstPosition.id).toPromise();
      _.each(skill.skills, (val) => {
        let index = _.findIndex(this.firstPosition.skills, {'name': val});
        if (index !== -1) {
          this.firstPosition.skills[index]['match'] = true;
        }
      });
    } catch (err) {
    }
  }

  // collect position
  checkCollectPosition(position: IPosition): boolean {
    if (this.auth.isAuthenticated()) this.reloadCheckBookMark(position);
    return position.bookmarkStatus;
  }

  async reloadCheckBookMark(position: IPosition): Promise<any> {
    try {
      let data = await this.positionService.checkBookMark(position.id).toPromise();
      position.bookmarkStatus = data.bookmarkStatus;
    } catch (err) {
      position.bookmarkStatus = false;
    }
  }

  collectPosition(id: string) {
    if (this.auth.isAuthenticated()) {
      this.reloadCollectPosition(id);
    } else {
      this.router.navigate(['/auth/login']);
    }

  }

  async reloadCollectPosition(id: string): Promise<any> {
    let item = _.findIndex(this.positions, {id: id});
    try {
      await this.positionService.collectBookMark(id).toPromise();
      this.positions[item].bookmarkStatus = true;
    } catch (err) {
      this.positions[item].bookmarkStatus = false;
    }
  }

  removeCollectPosition(id: string) {
    this.positionId = id;
    this.showChildModal();
  }

  deleteCollectPosition() {
    this.hideChildModal();
    let item = _.findIndex(this.positions, {id: this.positionId});
    this.reloadRemoveCollectPosition(this.positionId);
    this.firstPosition.bookmarkStatus = false;
    this.positions[item].bookmarkStatus = false;
  }

  async reloadRemoveCollectPosition(id: string): Promise<any> {
    try {
      await this.positionService.removeBookMark(id).toPromise();
    } catch (err) {
    }
  }

  public showChildModal(): void {
    this.childRemoveModal.show();
  }

  public hideChildModal(): void {
    this.childRemoveModal.hide();
  }

  // apply position
  checkApplied(): void {
    if (this.auth.isAuthenticated()) {
      this.reloadCheckApplyPosition();
      this.reloadPositionQuestion();
    } else {
      this.firstPosition.isApplied = false;
    }
  }

  async reloadCheckApplyPosition(): Promise<any> {
    try {
      let data = await this.positionService.checkApplyPosition(this.firstPosition.id).toPromise();
      this.firstPosition.isApplied = data.check;
    } catch (err) {
      this.firstPosition.isApplied = false;
    }
  }

  async reloadPositionQuestion(): Promise<any> {
    this.questionLoading = true;
    try {
      let data = await this.positionService.getQuestion(this.firstPosition.id).toPromise();
      this.firstPosition.positionQuestion = data;
      _.forEach(this.firstPosition.positionQuestion, (value: IPositionQuestion) => {
        if (_.isNaN(this.firstPosition.answerNum) || _.isUndefined(this.firstPosition.answerNum)) this.firstPosition.answerNum = 0;
        if (value.isRequired) {
          this.firstPosition.answerNum++;
        }
      });
      this.questionLoading = false;
    } catch (err) {
      this.questionLoading = false;
    }
  }

  checkApply() {
    if (_.isUndefined(this.firstPosition.positionQuestion)) this.firstPosition.positionQuestion = [];
    if (_.isUndefined(this.firstPosition.positionAnswer)) this.firstPosition.positionAnswer = [];
    if (this.firstPosition.positionQuestion.length > 0) {
      if (_.isNaN(this.firstPosition.pastNum) || _.isUndefined(this.firstPosition.pastNum)) this.firstPosition.pastNum = 0;
      _.forEach(this.firstPosition.positionQuestion, (value: IPositionQuestion) => {
        if (value.isRequired && !_.isUndefined(value.answer)) {
          this.firstPosition.pastNum++;
        }
        if (!_.isUndefined(value.answer)) this.post.positionAnswer.push({
          'answer': value.answer,
          'questionId': value.id
        });
      });
      if (this.firstPosition.answerNum === this.firstPosition.pastNum) this.reloadPositionAnswer(this.post.positionAnswer);
    } else {
      this.reloadPositionAnswer();
    }
  }

  async reloadPositionAnswer(answers?: IQuestion[]): Promise<any> {
    try {
      let data = await this.positionService.applyPosition(this.firstPosition.id, answers).toPromise();
      this.firstPosition.isApplied = true;
      this.hideApplyModal();
    } catch (err) {
      this.firstPosition.isApplied = false;
    }
  }

  async reloadPositionClickNum(id): Promise<any> {
    try {
      await this.positionService.getPositionClickNum(id).toPromise();
    } catch (err) {
    }
  }

  async readPositionCategroy(categories: any): Promise<any> {
    try {
      let result = await this.positionService.getFindCategroyPosition(categories.parentId).toPromise();
      return Promise.resolve(categories['categoriesName'] = result.name);
    } catch (err) {
    }
  }

  setCandidate(id: string) {
    if (this.auth.isAuthenticated()) {
      if (this.user.resume !== null) {
        this.showApplyModal();
      } else {
        this.toasterService.pop('error', '', this.translate.instant('message.Perfect_information'));
      }
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  public showApplyModal(): void {
    this.childApplyModal.show();
  }

  public hideApplyModal(): void {
    this.childApplyModal.hide();
  }


  async reloadOtherPosition(position: IPosition): Promise<any> {
    try {
      let data = await this.positionService.getOtherPosition(position.companyId, {
        limit: 3,
        active: true,
        minExpiredDate: moment(this.currentDate).format('YYYY-MM-DD')
      }).toPromise();
      this.otherPositions = data.result;
      let index = _.findIndex(this.otherPositions, {id: position.id});
      if (index !== -1) this.otherPositions.splice(index, 1);
    } catch (err) {
    }
  }

  async readCategory(): Promise<any> {
    try {
      let data = await this.userPostService.getArticleCategoryTree({}).toPromise();
      data.result = _.sortBy(data.result, ['id', 'id']);
      this.category = data.result[0].children;
      this.reloadRelatedPost();
    } catch (err) {
    }
  }

  async reloadRelatedPost(): Promise<any> {
    this.relatedLoading = true;
    try {
      if (this.firstPosition.skills.length > 0) {
        let data = await this.postService.get({
          'tags': _.map(this.firstPosition.skills, 'name').join(),
          'limit': 10
        }).toPromise();
        this.relatedPosts = data.result;
        _.forEach(this.relatedPosts, (value: IPost) => {
          value.userName = this.postService.getUserName(value);
        });
      }
      this.relatedLoading = false;
    } catch (err) {
      this.relatedLoading = false;
    }
  }


  // get user experience , education chart
  getChart(id: string) {
    this.pieChartType = 'pie';
    this.isLogin = this.auth.isAuthenticated();
    this.reloadPositionChart(id);
  }

  async reloadPositionChart(id: string): Promise<any> {
    this.chartLoading = true;
    try {
      let data = await this.positionService.getChart(id).toPromise();
      this.candidateNum = data.result.totalCandidates;
      this.educationChartLabels = [];
      this.educationChartData = [];
      this.experienceChartData = [];
      this.experienceChartLabels = [];
      _.each(data.result.educationLevels, (value: any) => {
        this.educationChartLabels.push(value.name);
        this.educationChartData.push(value.value);
      });
      _.each(data.result.yearOfExperience, (value: any) => {
        this.experienceChartLabels.push(value.name);
        this.experienceChartData.push(value.value);
      });
      this.chartLoading = false;
    } catch (err) {
      this.chartLoading = false;
    }
  }

  // search position by tags
  searchPosition(type: string, name: string) {
    switch (type) {
      case 'tags':
        this.searchService.searchType('tags');
        this.router.navigate(['/search-position'], {queryParams: {tags: name}});
        break;
      case 'categoryIds':
        let arr = [];
        arr[0] = name;
        this.router.navigate(['/search-position'], {queryParams: {categoryIds: arr}});
        break;
    }
  }


  async contact(): Promise<any> {
    if (this.auth.isAuthenticated() && localStorage.getItem('role') === 'user') {
      try {
        await this.userService.updateContent(this.firstPosition.companyId).toPromise();
        this.chatService.showChat(true);
      } catch (err) {

      }
    } else {
      this.router.navigate(['auth', 'login']);
    }
  }


  //滚动下拉分页
  async onScrollDown(): Promise<any> {
    this.pageNum.page = this.meta.pagination.nextPage;
    if (!_.isNull(this.pageNum.page)) {
      await this.load();
    }
  }

  async load(): Promise<any> {
    try {
      this.positionLoading2 = true;
      let data = await this.positionService.get(this.pageNum).toPromise();
      this.meta = data.meta;
      _.forEach(data.result, (value: IPosition) => {
        // save position
        this.positions.push(value);
        value['bookmarkStatus'] = this.checkCollectPosition(value);
      });
      this.positionLoading2 = false;
    } catch (err) {
      this.positionLoading2 = false;
    }
  }
}
