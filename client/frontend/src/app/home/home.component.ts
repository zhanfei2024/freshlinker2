import {Component, OnInit} from '@angular/core';
import {PositionService, IPosition, ITab} from '../position/position.service';
import {HomeService} from './home.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import {PostService, IPost} from '../post/post.service';
import {SeoService} from '../../common/global/seo';


@Component({
  templateUrl: './home.component.html',
})


export class HomeComponent implements OnInit {
  // position
  public myInterval: number = 5000;
  public noWrapSlides: boolean = false;
  public hotPosition: IPosition[] = [];
  public articleTabs: ITab[] = [];
  public activityTabs: ITab[] = [];
  public qATabs: ITab[] = [];
  public article: IPost[] = [];
  public activity: IPost[] = [];
  public qa: IPost[] = [];
  public banner: any[] = [];
  public featuredArticle: any;
  public featuredActivity: any;
  public filterParams: any = {};
  public params: any = {};
  public hotArticleIndex: number;
  public hotActivityIndex: number;
  public hotQAIndex: number;
  public category: string;
  public active: number = 1;
  public positionLoading: boolean = false;
  public articleLoading: boolean = false;
  public activityLoading: boolean = false;
  public slideLoading: boolean = false;
  public qaLoading: boolean = false;
  public psotArticleCategoryId: number;
  public psotqaCategoryId: number;
  public articleNumber: number;
  public qaNumber: number;
  public commentsNumber: number;

  constructor(private positionService: PositionService,
              private postService: PostService,
              private seoService: SeoService,
              private homeService: HomeService) {
  }

  ngOnInit() {
    this.seoService.setTitle('FreshLinker – Hong Kong’s leading career platform for young talents.');
    //设置文章tab标题
    this.articleTabs = [
      {
        id: 2,
        name: 'article.lastest_career_news'
      },
      {
        id: 3,
        name: 'article.interview_sharing'
      },
      {
        id: 4,
        name: 'article.job_seeking_tips'
      },
      {
        id: 5,
        name: 'article.insider_tips'
      },
      {
        id: 6,
        name: 'article.expert_blogs'
      }
    ];

    //设置活动tab标题
    this.activityTabs = [
      {
        id: 8,
        name: 'activity.career_talk'
      },
      {
        id: 9,
        name: 'activity.career_expo'
      },
      {
        id: 10,
        name: 'activity.recruitment_day'
      }
    ];

    //设置问答tab标题
    this.qATabs = [
      {
        id: 12,
        name: 'activity.career_planing'
      },
      {
        id: 13,
        name: 'activity.interview_tips'
      },
      {
        id: 14,
        name: 'activity.company_peaks'
      }
    ];

    //加载职位数据
    this.reloadHotPosition();

    //加载文章第一个分类数据
    this.changeTab('hotArticle', 2);
    //加载活动第一个分类数据
    this.changeTab('hotActivity', 8);
    //加载活动第一个分类数据
    this.changeTab('hotQA', 12);
    this.readBanner();

  }

  async readBanner(): Promise<any> {
    try {
      this.slideLoading = true;
      let result = await this.homeService.getBanner('1').toPromise();
      let obj = result.result.global;
      this.banner = obj.banner;
      this.slideLoading = false;
    } catch (err) {
      this.slideLoading = false;
    }
  }

  // 获取 hotPosition
  async reloadHotPosition() {
    if (!_.isNull(localStorage.getItem('id_token'))) {
      await  this.obtainInvitationHotPosition();
      await this.obtainInvitationPosition();
    } else {
      await this.obtainHotPosition();
    }

  }

  //获取邀请热门职位
  async obtainInvitationHotPosition(): Promise<any> {
    this.positionLoading = true;
    try {
      let data = await this.homeService.getInvitation({'limit': 10}).toPromise();
      _.forEach(data.result, (val: IPosition) => {
        let i = _.findIndex(this.hotPosition, {id: val.id});
        if (i === -1) {
          val['isJobInvitation'] = true;
          this.hotPosition.unshift(val);
        }
      });
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
      _.forEach(data.result, (item: IPosition) => {
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

  //切换文章tab点击加载数据
  changeTab(category: string, tabId: number) {
    this.category = category;
    let categoryId = [];
    categoryId[0] = tabId;
    switch (category) {
      case 'hotArticle':
        this.hotArticleIndex = tabId;
        // 清空featuredArticle 内容为空时，产生的错误。
        this.featuredArticle = {};
        this.filterParams = {'categoryIds': categoryId, 'limit': 3, 'sorting': 'popular'};
        this.params = {'categoryIds': categoryId, 'limit': 3, 'sorting': 'featured'};
        this.getArticle(this.filterParams);
        this.getFeaturedArticle(this.params);
        break;
      case 'hotActivity':
        this.hotActivityIndex = tabId;
        this.filterParams = {
          'categoryIds': categoryId,
          'limit': 4,
          'minExpiredDate': moment(new Date).format('YYYY-MM-DD')
        };
        this.params = {'categoryIds': categoryId, 'limit': 3, 'sorting': 'featured'};
        this.getActivity(this.filterParams);
        this.getFeaturedActivity(this.params);
        break;
      case 'hotQA':
        this.hotQAIndex = tabId;
        this.filterParams = {'categoryIds': categoryId, 'limit': 4};
        this.getQa(this.filterParams);
        break;
    }
  }

  //获取文章数据
  async getArticle(article: any): Promise<any> {
    this.articleLoading = true;
    try {
      let data = await this.postService.get(article).toPromise();
      this.article = data.result;
      this.articleLoading = false;
    } catch (err) {
      this.articleLoading = false;
    }
  }

  //获取活动数据
  async getActivity(article: any): Promise<any> {
    this.activityLoading = true;
    try {
      let data = await this.postService.get(article).toPromise();
      this.activity = data.result;
      this.activityLoading = false;
    } catch (err) {
      this.activityLoading = false;
    }
  }

  //获取问答数据
  async getQa(article: any): Promise<any> {
    this.qaLoading = true;
    try {
      let data = await this.postService.get(article).toPromise();
      this.qa = data.result;
      this.qaLoading = false;
    } catch (err) {
      this.qaLoading = false;
    }
  }

  //获取封面文章数据
  async getFeaturedArticle(article: any): Promise<any> {
    this.articleLoading = true;
    try {
      let data = await this.postService.get(article).toPromise();
      this.featuredArticle = data.result[0];
      this.articleLoading = false;
    } catch (err) {
      this.articleLoading = false;
    }
  }

  //获取封面活动数据
  async getFeaturedActivity(article: any): Promise<any> {
    this.activityLoading = true;
    try {
      let data = await this.postService.get(article).toPromise();
      this.featuredActivity = data.result;
      this.activityLoading = false;
    } catch (err) {
      this.activityLoading = false;
    }
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
      _.each(data.result, (val) => {
        parentId = val.categories[0].parentId;
        if (parentId === 1) {
          articleCount++;
        }
        if (parentId === 11) {
          qaCount++;
        }
        if (parentId === 7) {
          comment++;
        }
      });
      this.articleNumber = articleCount;
      this.commentsNumber = comment;
      this.qaNumber = qaCount;
    } catch (err) {

    }
  }


}







