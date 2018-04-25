import {Component, ViewChild, OnInit} from "@angular/core";
import {ModalDirective} from 'ngx-bootstrap';
import {BreadcrumbService} from '../../../common/breadcrumb/breadcrumb.service';
import {PositionService, IPosition, IFilter, ITab, IMeta, IPositionQuestion, IQuestion} from '../position.service';
import {Auth} from '../../auth/auth.service';
import {Router, ActivatedRoute} from '@angular/router';
import * as _ from "lodash";
import * as moment from "moment";
import {PostService, IPost} from "../../post/post.service";
import {UserService, IUser} from "../../user/user.service";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {LocationService} from "../../../common/service/location.service";
import {SeoService} from "../../../common/global/seo";
import {searchService} from "../../search/search.service";
import {UserPostService} from "../../user/user_article/user_article.service";
import {ChatService} from "../../../common/chat/chat.service";
import {el} from "@angular/platform-browser/testing/src/browser_util";

@Component({
  templateUrl: './position-show.component.html',
})
export class PositionShowComponent implements OnInit {

  public position: IPosition;
  public positions: IPosition[] = [];
  public firstPosition: IPosition;
  public otherPositions: IPosition[] = [];
  public relatedPosts: IPost[] = [];
  public parentLocations: string;
  public user: IUser = {};
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
  public firstPositionId: string;
  public tableLoading: boolean = true;
  public Loading: boolean = true;
  public positionLoading: boolean = true;
  public positionLoading2: boolean;
  public relatedPositionLoading: boolean = false;
  public relatedLoading: boolean = false;
  public questionLoading: boolean = false;
  public applyRole: boolean = false;


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
  //public backgroundColor: string[] = ['#e9c83b', '#00b216', '#205080', '#ff7b9a', '#f44543', '#ffab45', '#4edfeb'];
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
                     private locationService: LocationService,
                     private postService: PostService,
                     private userPostService: UserPostService,
                     private toasterService: ToasterService,
                     private searchService: searchService,
                     private translate: TranslateService,
                     private auth: Auth,
                     private router: Router,
                     private userService: UserService,
                     private seoService: SeoService,
                     private chatService: ChatService,
                     private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      (params) => {
        this.reloadPosition();
      });
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
    if (this.auth.isAuthenticated()) {
      this.readUser();
    }
    if (this.auth.isAuthenticated() && localStorage.getItem('role') === 'enterprise') {
      this.applyRole = true;
    }
  }

  //获取用户
  async readUser() {
    try {
      let data = await this.userService.find({}).toPromise();
      this.user = data;
    } catch (err) {
    }
  }

  //切换tab
  changeTab(id: number) {
    this.Loading = true;
    this.positionIndex = id;
    if (this.positionIndex === 2) this.readCategory();
    this.Loading = false;
  }

  //获取职位
  async reloadPosition(): Promise<any> {
    this.tableLoading = true;
    this.positionLoading = true;
    try {
      this.activatedRoute.data.subscribe((data: { positionFindResolve: any }) => {
        this.position = data.positionFindResolve;
        this.seoService.setTitle(this.position.name);
        this.firstPositionId = this.position.id;
        this.checkApplied();
        this.reloadPositionClickNum(this.position.id);
        if (this.position['locations'] !== null) {
          this.reloadFinLocations(this.position['locations'].parentId);
        }
        this.reloadOtherPosition(this.position);
        this.changeTab(1);
        this.getChart(this.position.id);
        if (this.auth.isAuthenticated()) {
          this.reloadUserSkills();
        } else {
          _.forEach(this.position.skills, (value: any) => {
            value['match'] = false;
          });
        }
        this.position['bookmarkStatus'] = this.checkCollectPosition(this.position);
        _.each(this.position.categories, async (result) => {
          result['categoriesName'] = await this.readPositionCategroy(result);
        });
        // breadcrumb
        this.breadcrumbService.clear();
        this.breadcrumbService.set({title: 'position.positions', router: '/position-list'});
        this.breadcrumbService.set({title: this.position.name, router: `/positions/${this.position.id}`});
        this.tableLoading = false;
        this.positionLoading = false;
      });
    } catch (err) {
      this.tableLoading = false;
      this.positionLoading = false;
    }
    if (!_.isUndefined(this.position.temptation) && !_.isNull(this.position.temptation)) {
      this.selftemptation = this.position.temptation.split(',');
    }
    if (_.isUndefined(this.position.positionQuestion)) this.position.positionQuestion = [];
    if (_.isUndefined(this.position.positionAnswer)) this.position.positionAnswer = [];
    this.reloadRelatedPosition();
  }


  async reloadUserSkills(): Promise<any> {
    try {
      let skill = await this.userService.getComparedSkill(this.position.id).toPromise();
      _.each(skill.skills, (val) => {
        let index = _.findIndex(this.position.skills, {'name': val});
        if (index !== -1) {
          this.position.skills[index]['match'] = true;
        }
      });
    } catch (err) {
    }
  }


  //获取相关职位
  async reloadRelatedPosition(): Promise<any> {
    this.relatedPositionLoading = true;
    try {
      this.positions = [];
      let data = await this.positionService.getRelatedPosition({
        categoryIds: _.map(this.position.categories, 'id'),
        limit: this.pageNum.limit,
        page: this.pageNum.page
      }).toPromise();
      _.forEach(data.result, (value: any) => {
        // save position
        value.bookmarkStatus = this.checkCollectPosition(value);
        if (value.id !== this.position.id) {
          this.positions.push(value);
        }
      });
      this.meta = data.meta;
      this.relatedPositionLoading = false;
    } catch (err) {
      this.relatedPositionLoading = false;
    }
  }


  // 执行收藏职位
  checkCollectPosition(position: IPosition): boolean {
    if (this.auth.isAuthenticated()) this.reloadCheckBookMark(position);
    return position.bookmarkStatus;
  }

  //加载收藏
  async reloadCheckBookMark(position: IPosition): Promise<any> {
    try {
      let data = await this.positionService.checkBookMark(position.id).toPromise();
      position.bookmarkStatus = data.bookmarkStatus;
    } catch (err) {
      position.bookmarkStatus = false;
    }
  }

  async reloadFinLocations(id: string): Promise<any> {
    try {
      let data = await this.locationService.find(id).toPromise();
      this.parentLocations = data.name;
    } catch (err) {
    }
  }


  collectPosition(id: string) {
    if (this.auth.isAuthenticated() && localStorage.getItem('role') === 'user') {
      this.reloadCollectPosition(id);
    } else {
      this.router.navigate(['/auth/login']);
    }

  }

  async reloadCollectPosition(id: string): Promise<any> {
    try {
      let data = await this.positionService.collectBookMark(id).toPromise();
      this.position['bookmarkStatus'] = true;
    } catch (err) {
      this.position['bookmarkStatus'] = false;
    }
  }

  removeCollectPosition(id: string) {
    this.positionId = id;
    this.showChildModal();
  }

  deleteCollectPosition() {
    this.hideChildModal();
    this.reloadRemoveCollectPosition(this.positionId);
    this.position['bookmarkStatus'] = false;
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
      this.position.isApplied = false;
    }
  }

  async reloadCheckApplyPosition(): Promise<any> {
    try {
      let data = await this.positionService.checkApplyPosition(this.position.id).toPromise();
      this.position.isApplied = data.check;
    } catch (err) {
      this.position.isApplied = false;
    }
  }

  async reloadPositionQuestion(): Promise<any> {
    this.questionLoading = true;
    try {
      let data = await this.positionService.getQuestion(this.position.id).toPromise();
      this.position.positionQuestion = data;
      _.forEach(this.position.positionQuestion, (value: IPositionQuestion) => {
        if (_.isNaN(this.position.answerNum) || _.isUndefined(this.position.answerNum)) this.position.answerNum = 0;
        if (value.isRequired) {
          this.position.answerNum++;
        }
      });
      this.questionLoading = false;
    } catch (err) {
      this.questionLoading = false;
    }
  }

  checkApply() {
    if (_.isUndefined(this.position.positionQuestion)) this.position.positionQuestion = [];
    if (_.isUndefined(this.position.positionAnswer)) this.position.positionAnswer = [];
    if (this.position.positionQuestion.length > 0) {
      if (_.isNaN(this.position.pastNum) || _.isUndefined(this.position.pastNum)) this.position.pastNum = 0;
      _.forEach(this.position.positionQuestion, (value: IPositionQuestion) => {
        if (value.isRequired && !_.isUndefined(value.answer)) {
          this.position.pastNum++;
        }
        if (!_.isUndefined(value.answer)) this.post.positionAnswer.push({
          'answer': value.answer,
          'questionId': value.id
        });
      });
      if (this.position.answerNum === this.position.pastNum) this.reloadPositionAnswer(this.post.positionAnswer);
    } else {
      this.reloadPositionAnswer();
    }

  }

  async reloadPositionAnswer(answers?: IQuestion[]): Promise<any> {
    try {
      let data = await this.positionService.applyPosition(this.position.id, answers).toPromise();
      this.position.isApplied = true;
      this.toasterService.pop('success', 'Success', this.translate.instant('message.apply_position_success_msg'));
      this.hideApplyModal();
    } catch (err) {
      this.position.isApplied = false;
      this.toasterService.pop('error', '', this.translate.instant('message.apply_position_error_msg'));
    }
  }

  async reloadPositionClickNum(id): Promise<any> {
    try {
      await this.positionService.getPositionClickNum(id).toPromise();
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
      localStorage.setItem('loginRequest', 'back');
      this.router.navigate(['/auth/login']);
    }
  }

  async readPositionCategroy(categories: any): Promise<any> {
    try {
      let result = await this.positionService.getFindCategroyPosition(categories.parentId).toPromise();
      return Promise.resolve(categories['categoriesName'] = result.name);
    } catch (err) {
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
      if (this.position.skills.length > 0) {
        let data = await this.postService.get({
          'tags': _.map(this.position.skills, 'name').join(),
          'categoryIds': _.map(this.category, 'id'),
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
        await this.userService.updateContent(this.position.companyId).toPromise();
        this.chatService.showChat(true);
      } catch (err) {

      }
    } else {
      localStorage.setItem('loginRequest', 'back');
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
      let data = await this.positionService.getRelatedPosition({
        categoryIds: _.map(this.position.categories, 'id'),
        limit: this.pageNum.limit,
        page: this.pageNum.page
      }).toPromise();
      this.meta = data.meta;
      _.forEach(data.result, (value: IPosition) => {
        // save position
        value['bookmarkStatus'] = this.checkCollectPosition(value);
        if (value.id !== this.position.id) {
          this.positions.push(value);
        }
      });
      this.positionLoading2 = false;
    } catch (err) {
      this.positionLoading2 = false;
    }
  }

}
