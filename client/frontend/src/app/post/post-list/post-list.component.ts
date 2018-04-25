import {Component, OnInit} from "@angular/core";
import {BreadcrumbService} from '../../../common/breadcrumb/breadcrumb.service';
import * as _ from "lodash";
import {ActivatedRoute, Router} from "@angular/router";
import {Auth} from "../../auth/auth.service";
import {UserService, IUser} from "../../user/user.service";
import {searchService} from "../../search/search.service";
import {PositionService} from "../../position/position.service";
import {TranslateService} from "@ngx-translate/core";
import {SeoService} from "../../../common/global/seo";
import {IFilter, IMeta, IPost, ITab, ITag, PostService} from "../post.service";

@Component({
  templateUrl: './post-list.component.html',
})
export class PostListComponent implements OnInit {
  public filter: IFilter = {
    page: 1,
    limit: 10,
    sorting: '',
    search: '',
  };
  public user: IUser = {};
  public article: IPost[] = [];
  public newArticles: IPost[] = [];
  public hotTags: ITag[] = [];
  public tabs: ITab[] = [];
  public activityTabs: ITab[] = [];
  public QATabs: ITab[] = [];
  public relatedPositions: any;
  public cateGoryTab: any;
  public index: number;
  public categoryIndex: number;
  public tabLoading: boolean;
  public articleLoading: boolean;
  public isUserLogin = false ;
  public page: any = {};
  public pageNum: IFilter = {
    page: 1,
    limit: 5,
    categoryIds: []
  };
  public meta: IMeta = {pagination: {}};
  public newLoading: boolean = false;
  public hotTagsLoading: boolean = false;
  public psotArticleCategoryId: number;
  public psotqaCategoryId: number;
  public articleNumber: number;
  public qaNumber: number;
  public commentsNumber: number;
  public userArticleNumber: number;
  public userQaNumber: number;
  public userCommentsNumber: number;
  public relatedPositionsLoading: boolean;
  public constructor(private postService: PostService,
                     private activatedRoute: ActivatedRoute,
                     private positionService: PositionService,
                     private userService: UserService,
                     private searchService: searchService,
                     private translate: TranslateService,
                     private router: Router,
                     private auth: Auth,
                     private seoService: SeoService,
                     private breadcrumbService: BreadcrumbService) {

  }

  ngOnInit() {
    if (localStorage.getItem( 'role') === 'user' && this.auth.isAuthenticated()) {
      this.isUserLogin = true;
    }

    if (this.isUserLogin) {
      this.reloadUser();
    }
    //设置分类标题
    this.cateGoryTab = [
      {
        id: 2,
        src: 'article_content.png',
        router: '/article-list/2'
      },
      {
        id: 8,
        src: 'article_activity.png',
        router: '/activity-list/8'

      },
      {
        id: 12,
        src: 'article_qa.png',
        router: '/qa-list/12'
      },
    ];

    //设置活动tab
    this.tabs = [
      {
        id: 2,
        name: 'article.lastest_career_news'
      },
      {
        id: 3,
        name: 'article.job_seeking_tips'
      },
      {
        id: 4,
        name: 'article.interview_sharing'
      },
      {
        id: 5,
        name: 'article.expert_blogs'
      },
      {
        id: 6,
        name: 'article.insider_tips'
      }
    ];

    //设置活动tab
    this.activityTabs = [
      {
        id: 8,
        name: "activity.career_talk"
      },
      {
        id: 9,
        name: "activity.career_expo"
      },
      {
        id: 10,
        name: "activity.recruitment_day"
      }
    ];

    //设置问答tab
    this.QATabs = [
      {
        id: 12,
        name: "activity.career_planing"
      },
      {
        id: 13,
        name: "activity.interview_tips"
      },
      {
        id: 14,
        name: "activity.company_peaks"
      }
    ];



    //加载最新文章
    this.reloadNewestPost();

    //加载热门标签
    this.reloadHotTags();
    this.reloadPosition();


    //进来页面时加载分类数据
    this.activatedRoute.params.subscribe(
      (params) => {
        //设置面包屑
        this.breadcrumbService.clear();
        let breadcrum;
        if (location.pathname === '/article-list/2' || location.pathname === '/article-list/3' || location.pathname === '/article-list/4'
          || location.pathname === '/article-list/5' || location.pathname === '/article-list/6') {
          this.categoryTab(2);
          breadcrum = {title: 'article.position_article', router: '/article-list/2'};
          this.seoService.setTitle(this.translate.instant('article.position_article'), this.seoService.getTitleContent());
        } else if (location.pathname === '/activity-list/8' || location.pathname === '/activity-list/9' || location.pathname === '/activity-list/10') {
          this.categoryTab(8);
          breadcrum = {title: 'activity.workplace_activities', router: '/activity-list/8'};
          this.seoService.setTitle(this.translate.instant('activity.workplace_activities'), this.seoService.getTitleContent());
        } else if (location.pathname === '/qa-list/12' || location.pathname === '/qa-list/13' || location.pathname === '/qa-list/14') {
          this.categoryTab(12);
          breadcrum = {title: 'article.position_qa', router: '/qa-list/12'};
          this.seoService.setTitle(this.translate.instant('article.position_qa'), this.seoService.getTitleContent());
        }
        // switch (location.pathname) {
        //   case '/article-list/2':
        //     this.categoryTab(2);
        //     breadcrum = {title: 'article.position_article', router: '/article-list/2'};
        //     this.seoService.setTitle(this.translate.instant('article.position_article'),this.seoService.getTitleContent());
        //     break;
        //   case '/activity-list/8':
        //     this.categoryTab(8);
        //     breadcrum = {title: 'activity.workplace_activities', router: '/activity-list/8'};
        //     this.seoService.setTitle(this.translate.instant('activity.workplace_activities'),this.seoService.getTitleContent());
        //     break;
        //   case '/qa-list/12':
        //     this.categoryTab(12);
        //     breadcrum = {title: 'article.position_qa', router: '/qa-list/12'};
        //     this.seoService.setTitle(this.translate.instant('article.position_qa'),this.seoService.getTitleContent());
        //     break;
        // }
        this.breadcrumbService.set(breadcrum);
        this.articleTab(_.toNumber(params['id']));
        this.index = _.toNumber(params['id']);
      }
    );
  }

  //获取用戶
  async reloadUser(): Promise<any> {
    try {
      let data = await this.userService.find({}).toPromise();
      this.user = data;
      this.showUserComtent(this.user.id.toString());
    } catch (err) {
    }
  }

  //获取最新新闻数据
  async reloadNewestPost(): Promise<any> {
    let vm = this;
    vm.newLoading = true;
    try {
      let data = await vm.postService.get({'sorting': 'newest', 'limit': 5}).toPromise();
      _.forEach(data.result, function (value: IPost) {
        value['userName'] = vm.postService.getUserName(value);
      });
      this.newArticles = data.result;
      this.newLoading = false;
    } catch (err) {
      this.newLoading = false;
    }
  }

  //获取職位数据
  async reloadPosition(): Promise<any> {
    this.relatedPositionsLoading = true;
    try {
      let data = await this.positionService.get({'sorting': 'newest', 'limit': 5}).toPromise();
      this.relatedPositions = data.result;
      this.relatedPositionsLoading = false;
    } catch (err) {
      this.relatedPositionsLoading = false;
    }
  }

  //获取热门标签
  async reloadHotTags(): Promise<any> {
    this.hotTagsLoading = true;
    try {
      let data = await this.postService.getTags({'type': 'tag', 'limit': 10}).toPromise();
      this.hotTags = data.result;
      this.hotTagsLoading = false;
    } catch (err) {
      this.hotTagsLoading = false;
    }
  }

  //创建切换大分类选项卡
  categoryTab(id: number) {
    this.categoryIndex = id;
  }

  //创建切换小分类选项卡
  articleTab(id: number) {
    this.pageNum.categoryIds[0] = id;
    this.index = id;
    this.CallServer();
  }

  //加载分页
  async changePage(event: any, id: number) {
    this.articleLoading = true;
    this.pageNum.page = event.page;
    this.pageNum.limit = event.itemsPerPage;
    this.pageNum.categoryIds[0] = id;
    await this.CallServer();
  }

  //获取分页数据
  async CallServer(): Promise<any> {
    let params = this.pageNum;
    try {
      this.articleLoading = true;
      this.tabLoading = true;
      let data = await this.postService.get({
        'categoryIds': params.categoryIds,
        'limit': params.limit,
        'page': params.page
      }).toPromise();
      this.meta = data.meta;
      this.article = data.result.sort(this.compare('updatedAt'));
      this.articleLoading = false;
      this.tabLoading = false;
    } catch (err) {
      this.tabLoading = false;
      this.articleLoading = false;
    }
  }

  /*根据数组中的对象某一个属性值进行排序*/
  compare(property: string): any {
    return function (a, b) {
      const value1 = parseInt(a[property].replace(/-|T|:/g, ''), 10);
      const value2 = parseInt(b[property].replace(/-|T|:/g, ''), 10);
      return value2 - value1;
    }
  }

  showUserComtent(id: string) {
    this.readPublicArticle(id);
  }

  showUser(id: string) {
    this.readPublicArticle(id);
  }



  async readPublicArticle(id: string): Promise<any> {
    try {
      let data = await this.postService.get({userId: id}).toPromise();
      let articleCount = 0;
      let qaCount = 0;
      let comment = 0;
      let parentId;
      _.forEach(data.result, (val) => {
        parentId = val['categories'][0] ? val['categories'][0]['parentId'] : null;
        switch (parentId) {
          case 1:
            articleCount++;
            break;
          case  11:
            qaCount++;
            break;
          case 7:
            comment++;
            break;
        }
      });
      this.articleNumber = articleCount;
      this.qaNumber = qaCount;
      this.userArticleNumber = articleCount;
      this.userQaNumber = qaCount;
      this.commentsNumber = comment;
      this.userCommentsNumber = comment;
    } catch (err) {
    }
  }



  searchArticle(name:string) {
    this.searchService.searchType('tags');
    this.router.navigate([`/search-article`], {queryParams: {tags: name}});
  }


  // 点击发布问题时跳转到对应的页面
  gotoPageCurrent(): void {
    let currentUrl = window.location.href;
    if (currentUrl.indexOf('article') >= 0) {
      this.router.navigate(['/user','article','edit']);
    } else if (currentUrl.indexOf('activity') >= 0) {
      this.router.navigate(['/user','activity','edit']);
    } else if (currentUrl.indexOf('qa')){
      this.router.navigate(['/user', 'qa', 'edit'])
    }
  }
}
