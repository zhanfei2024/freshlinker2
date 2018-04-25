import {Component, OnInit, ViewChild, Inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PostService, IPost, IMeta} from '.././post.service';
import {PositionService, IPosition, IFilter} from "../../position/position.service";
import {BreadcrumbService} from '../../../common/breadcrumb/breadcrumb.service';
import * as _ from "lodash";
import {Auth} from "../../auth/auth.service";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {SafeResourceUrl, DomSanitizer, DOCUMENT} from "@angular/platform-browser";
import {ModalDirective} from "ngx-bootstrap";
import {UserPostService} from "../../user/user_article/user_article.service";
import {PageScrollInstance, PageScrollService} from 'ng2-page-scroll';
import {SeoService} from "../../../common/global/seo";


@Component({
  templateUrl: './activity-show.component.html'
})

export class ActivityShowComponent implements OnInit {
  public activity: IPost;
  public relatedPosts: IPost[] = [];
  public relatedActivity: IPost[] = [];
  public relatedPositions: IPosition[] = [];
  public categoryIds: any[] = [];
  public relatedPostLoading: boolean = false;
  public relatedPositionsLoading: boolean;
  public answer: string;
  public replyAnswerText: string;
  public reply = [];
  public answerText = [];
  public twoAnswer = [];
  public totalReply: number;
  public likesid: number;
  public likes: boolean = false;
  public isLogin: boolean = false;
  public relatedActivityLoading: boolean = false;
  public replyLoading: boolean;
  public tag: string;
  public pageNum: IFilter = {
    page: 1,
    limit: 5,
  };
  public meta: IMeta = {pagination: {}};
  public psotArticleCategoryId: number;
  public psotqaCategoryId: number;
  public articleNumber: number;
  public qaNumber: number;
  public commentsNumber: number;
  public category: any = [];
  public activityCategory: any = [];

  public iframe: SafeResourceUrl;
  @ViewChild('Modal') public Modal: ModalDirective;
  public repoUrl: string;


  constructor(private activatedRoute: ActivatedRoute,
              private postService: PostService,
              private positionService: PositionService,
              private toasterService: ToasterService,
              private translate: TranslateService,
              private userPostService: UserPostService,
              private router: Router,
              @Inject(DOCUMENT) private document: any,
              private pageScrollService: PageScrollService,
              private auth: Auth,
              private sanitizer: DomSanitizer,
              private seoService: SeoService,
              private breadcrumbService: BreadcrumbService) {

  }

  ngOnInit() {
    this.activatedRoute.data.subscribe((data: { activityFindResolve: IPost }) => {
      this.activity = data.activityFindResolve;
      if(this.activity.url !== null){
        this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(this.activity.url);
      }
      this.views(this.activity.id);
      this.seoService.setTitle(this.activity.title, this.seoService.getTitleContent());
      this.breadcrumbService.clear();
      this.breadcrumbService.set({title: 'activity.workplace_activities', router: '/activity-list/8'});
      this.breadcrumbService.set({title: this.activity.title, router: `/activity/${this.activity.id}`});
    });


    this.readCategory();
    this.reloadReply();
    this.isLogin = this.auth.isAuthenticated();
    this.repoUrl = location.href;
  }

  async views(id: number): Promise<any>{
    try{
      this.postService.getClickNum(id).toPromise();
    }catch (err){
    }
  }


  async readCategory(): Promise<any> {
    try {
      let data = await this.userPostService.getArticleCategoryTree({}).toPromise();
      data.result = _.sortBy(data.result,['id','id']);
      this.category = data.result[0].children;
      this.category =_.map(this.category, 'id');
      this.activityCategory = data.result[1].children;
      this.activityCategory = _.map(this.activityCategory, 'id');
      if(this.activity.tags.length > 0){
        this.reloadRelatedPosts();
        this.reloadPosition();
      }
      this.reloadNewsActivity();
    } catch (err) {

    }
  }


  async reloadNewsActivity(): Promise<any> {
    this.relatedActivityLoading = true;
    try {
      let data = await this.postService.get({
        'sorting': 'newest',
        'categoryIds': this.activityCategory,
        'limit': 5
      }).toPromise();
      this.relatedActivity = data.result;
      this.relatedActivityLoading = false;
    } catch (err) {
      this.relatedActivityLoading = false;
    }
  }

  //获取職位数据
  async reloadPosition(): Promise<any> {
    this.relatedPositionsLoading = true;
    try {
      let data = await this.positionService.get({
        'tags': _.map(this.activity.tags, 'name').join(),
        'limit': 5
      }).toPromise();
      this.relatedPositions = data.result;
      this.relatedPositionsLoading = false;
    } catch (err) {
      this.relatedPositionsLoading = false;
    }
  }

  async reloadRelatedPosts(): Promise<any> {
    this.relatedPostLoading = true;
    try {
      let data = await this.postService.get({
        'tags': _.map(this.activity.tags, 'name').join(),
        'categoryIds': this.category,
        'limit': 6
      }).toPromise();
      _.each(data.result, (value: any) => {
        if (value.id !== this.activity.id) {
          this.relatedPosts.push(value);
        }
      });
      this.relatedPostLoading = false;
    } catch (err) {
      this.relatedPostLoading = false;
    }
  }


  //加载分页
  async changePage(event: any) {
    this.pageNum.page = event.page;
    this.pageNum.limit = event.itemsPerPage;
    await this.reloadReply();
  }

  async reloadReply(): Promise<any> {
    this.replyLoading = true;
    try {
      let data = await this.postService.getComment(this.activity.id, this.pageNum).toPromise();
      this.meta = data.meta;
      this.reply = data.result;
      if (this.auth.isAuthenticated()) {
        _.each(this.reply, (value, key) => {
          this.reply[key].like = this.checkCollectlike(value);
        });
      }
      this.replyLoading = false;
    } catch (err) {
      this.replyLoading = false;
    }
  }

  async like(id: number): Promise<any> {
    try {
      this.likesid = id;
      let data = await this.postService.clickLikes(id).toPromise();
      _.forEach(this.reply, (val) => {
        if (data.result.id === val.id) {
          if (val.like) {
            val.like = false;
          } else {
            val.like = true;
          }
          val.totalLike = data.result.totalLike;
        }
      });
    } catch (err) {

    }
  }

  async checkCollectlike(reply: IPost): Promise<boolean> {
    try {
      let data = await this.postService.getLikes(reply.id).toPromise();
      if (!_.isEmpty(data.result.CommentLikes)) {
        reply['like'] = true;
      } else {
        reply['like'] = false;
      }
      return Promise.resolve(reply['like']);
    } catch (err) {

    }
  }

  async showContent(index: number, id: number): Promise<any> {
    this.reply[index]['selected'] = !this.reply[index]['selected'];
    if (this.reply[index]['selected']) {
      try {
        let data = await this.postService.getAnswer(id).toPromise();
        this.answerText = data.result;
        if (this.answerText !== undefined) {
          this.totalReply = this.answerText.length;
        }
        this.twoAnswer = this.answerText;
      } catch (err) {

      }
    }
    if (this.totalReply !== undefined) {
      this.reply[index].totalReply = this.totalReply;
    }
  }

  async postAnwer(id: number): Promise<any> {
    if (this.auth.isAuthenticated()) {
      try {
        let data = await this.postService.storeAnswer(id, {content: this.replyAnswerText ,postId: this.activity.id}).toPromise();
        this.answerText.push(data.result);
        this.toasterService.pop('success', '', this.translate.instant('article.editorial_success_msg'));
        this.replyAnswerText = "";
      } catch (err) {
      }
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  async post(): Promise<any> {
    try {
      let data = await this.postService.storeComment(this.activity.id, {content: this.answer}).toPromise();
      this.reply.unshift(data.result);
      this.toasterService.pop('success', '', this.translate.instant('article.editorial_success_msg'));
      this.answer = "";
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('article.content_is_required'));
    }

  }

  showUser(id: string) {
    this.readArticleCategory();
    this.readQaCategory();
    this.readPublicArticle(id);
    this.readPublicComments(id);
  }

  async readArticleCategory(): Promise<any> {
    try {
      let data = await this.postService.getArticleCategory({name: "article"}).toPromise();
      this.psotArticleCategoryId = data.result[data.result.length - 1].id;
    } catch (err) {

    }
  }

  async readQaCategory(): Promise<any> {
    try {
      let data = await this.postService.getArticleCategory({name: "QA"}).toPromise();
      this.psotqaCategoryId = data.result[data.result.length - 1].id;
    } catch (err) {

    }
  }

  async readPublicArticle(id: string): Promise<any> {
    try {
      let data = await this.postService.get({userId: id}).toPromise();
      let articleCount = 0;
      let qaCount = 0;
      let parentId;
      _.forEach(data.result, (val) => {
        parentId = val.categories[0].parentId;
        if (parentId === this.psotArticleCategoryId) {
          articleCount++;
        }
        if (parentId === this.psotqaCategoryId) {
          qaCount++;
        }

      });
      this.articleNumber = articleCount;
      this.qaNumber = qaCount;
    } catch (err) {

    }
  }

  async readPublicComments(id: string): Promise<any> {
    try {
      let data = await this.postService.getPublicComments({userId: id}).toPromise();
      let comment = 0;
      _.forEach(data.result, (val:any) => {
        if (val.objectType === "Post") {
          comment++;
        }
      });
      this.commentsNumber = comment;
    } catch (err) {
    }
  }

  openForm() {
    if (this.auth.isAuthenticated()) {
      this.Modal.show();
    } else {
      localStorage.setItem('loginRequest', 'back');
      this.router.navigate(['/auth', 'login']);
    }
  }

  public goToLastHeading() {
    if (this.auth.isAuthenticated()) {
      let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, '#showComment');
      this.pageScrollService.start(pageScrollInstance);
    } else {
      localStorage.setItem('loginRequest', 'back');
      this.router.navigate(['/auth', 'login']);
    }
  }

}
