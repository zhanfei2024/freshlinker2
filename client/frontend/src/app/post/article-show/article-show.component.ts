import {Component, OnInit, Inject} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {PostService, IPost, IMeta} from '../post.service';
import {BreadcrumbService} from '../../../common/breadcrumb/breadcrumb.service';
import * as _ from "lodash";
import {IFilter, PositionService, IPosition} from "../../position/position.service";
import {Auth} from "../../auth/auth.service";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {UserPostService} from "../../user/user_article/user_article.service";
import {DOCUMENT} from "@angular/platform-browser";
import {PageScrollInstance, PageScrollService} from 'ng2-page-scroll';
import {SeoService} from "../../../common/global/seo";


@Component({
  templateUrl: './article-show.component.html'
})

export class ArticleShowComponent implements OnInit {

  public meta: IMeta = {pagination: {}};
  public article: IPost;
  public otherPosts: IPost[] = [];
  public relatedPosts: IPost[] = [];
  public relatedActivity: IPost[] = [];
  public relatedPositions: IPosition[] = [];
  public postLoading: boolean = false;
  public otherPostLoading: boolean = false;
  public relatedPostLoading: boolean = false;

  public postId: number;
  public answer: string;
  public replyAnswerText: string;
  public reply = [];
  public answerText = [];
  public twoAnswer = [];
  public totalReply: number;
  public likesid: number;
  public likes: boolean = false;
  public showComment: boolean = false;
  public showUserActive: boolean = false;
  public relatedActivityLoading: boolean = false;
  public replyLoading: boolean;
  public tag: string;
  public pageNum: IFilter = {
    page: 1,
    limit: 5,
  };
  public psotArticleCategoryId: number;
  public psotqaCategoryId: number;
  public articleNumber: number;
  public qaNumber: number;
  public commentsNumber: number;
  public relatedPositionsLoading: boolean = false;
  public category: any = [];
  public activityCategory: any = [];
  public repoUrl: string;

  public constructor(private postService: PostService,
                     private route: ActivatedRoute,
                     private toasterService: ToasterService,
                     private positionService: PositionService,
                     private translate: TranslateService,
                     private userPostService: UserPostService,
                     @Inject(DOCUMENT) private document: any,
                     private pageScrollService: PageScrollService,
                     private router: Router,
                     private auth: Auth,
                     private seoService: SeoService,
                     private breadcrumbService: BreadcrumbService) {
  }

  public ngOnInit(): void {
    this.showComment = this.auth.isAuthenticated();
    this.postLoading = true;
    this.route.data.subscribe((data: {postFindResolve: IPost}) => {
      this.reloadClickNum();
      this.article = data.postFindResolve;
      this.seoService.setTitle(this.article.title, this.seoService.getTitleContent());
      //  breadcrumb
      this.breadcrumbService.clear();
      this.breadcrumbService.set({title: 'global.articles', router: '/article-list/2'});
      this.breadcrumbService.set({title: this.article.title, router: `/articles/${this.article.id}`});
      this.postLoading = false;
      this.reloadReply();
      this.readCategory();
    });
    this.repoUrl = location.href;
  }

  async readCategory(): Promise<any> {
    try {
      let data = await this.userPostService.getArticleCategoryTree({}).toPromise();
      data.result = _.sortBy(data.result,['id','id']);
      this.category = data.result[0].children;
      this.activityCategory = data.result[1].children;
      if(this.article.tags.length > 0){
        this.reloadRelatedPosts();
        this.reloadOtherPosts();
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
        'categoryIds': _.map(this.activityCategory, 'id'),
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
        'tags': _.map(this.article.tags, 'name').join(),
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
        'tags': _.map(this.article.tags, 'name').join(),
        'categoryIds': _.map(this.category, 'id'),
        'limit': 6
      }).toPromise();
      _.each(data.result, (value: any)=> {
        if (value.id !== this.article.id) {
          this.relatedPosts.push(value);
        }
      });
      this.relatedPostLoading = false;
    } catch (err) {
      this.relatedPostLoading = false;
    }
  }


  async reloadOtherPosts(): Promise<any> {
    this.otherPostLoading = true;
    try {
      let data = await this.postService.get({
        'tags': _.map(this.article.tags, 'name').join(),
        'categoryIds': _.map(this.category, 'id'),
        'limit': 3
      }).toPromise();
      this.otherPosts = data.result;
      this.otherPostLoading = false;
    } catch (err) {
      this.otherPostLoading = false;
    }
  }

  async reloadClickNum(): Promise<any> {
    this.route.params.subscribe((data: any) => {
      this.postId = data.id;
    });
    try {
      await this.postService.getClickNum(this.postId).toPromise();
    } catch (err) {
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
      let data = await this.postService.getComment(this.article.id, this.pageNum).toPromise();
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
    if (localStorage.getItem('role') == undefined) {
      this.router.navigate(['/auth', 'login']);
    }
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
    if(this.auth.isAuthenticated()){
      try {
        let data = await this.postService.storeAnswer(id, {content: this.replyAnswerText, postId: this.article.id}).toPromise();
        this.answerText.push(data.result);
        this.toasterService.pop('success', '', this.translate.instant('article.editorial_success_msg'));
        this.replyAnswerText = "";
      } catch (err) {}
    }else{
      localStorage.setItem('loginRequest', 'back');
      this.router.navigate(['/auth/login']);
    }
  }

  async post(): Promise<any> {
    try {
      let data = await this.postService.storeComment(this.article.id, {content: this.answer}).toPromise();
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

  public goToLastHeading() {
    if(this.auth.isAuthenticated()){
      let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, '#showComment');
      this.pageScrollService.start(pageScrollInstance);
    }else{
      localStorage.setItem('loginRequest', 'back');
      this.router.navigate(['/auth','login']);
    }
  }


}
