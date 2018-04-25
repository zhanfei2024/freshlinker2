import {Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, AfterViewInit} from '@angular/core';
import {ICompany, HotCompanyService} from "../../hot_company/hot_company.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {IPost, PostService, ITab} from "../../post/post.service";
import {UpgradeCompanyService} from "../upgrade_campany_service";
import {IPosition, IMeta, IFilter, PositionService} from "../../position/position.service";
import * as _ from "lodash";
import {Auth} from "../../auth/auth.service";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {IPictures, CompanyService} from "../../company/service/company.service";
import {WelfareAwardsService} from "../../company/service/welfare-awards.service";
import {SafeResourceUrl, DomSanitizer} from "@angular/platform-browser";
import {NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation} from 'ngx-gallery';
import {SeoService} from "../../../common/global/seo";
import {UserPostService} from "../../user/user_article/user_article.service";
import {UserService} from "../../user/user.service";
import {ChatService} from "../../../common/chat/chat.service";



@Component({
  templateUrl: './upgrade_company_profile.component.html',
})
export class UpgradeCompanyProfileComponent implements OnInit, OnDestroy {
  public company: ICompany;
  public articles: IPost[];
  public welfare: any;
  public awards: any;
  public video: any;
  public companyId: string;
  public position: IPosition[];
  public otherPosition: IPosition[];
  public dynamic: any[];
  public reviews: any;
  public background: any;
  public reviewShow: any = {};
  public arr: Array<number> = [];
  public companyLoading: boolean;
  public articleLoading: boolean;
  public positionLoading: boolean;
  public dynamicLoading: boolean;
  public reviewsLoading: boolean;
  public welfareLoading: boolean;
  public awardsLoading: boolean;
  public show:boolean;
  public otherPositionLoading: boolean;
  public anonymous: boolean;
  public isShow: boolean = false;
  public headIndex: number = 1;
  public changeTabLoading: boolean;
  public videoLoading: boolean;
  public pictureLoading: boolean = false;
  public isDynamicMeta: boolean = false;
  public headList: ITab[] = [];
  public pictures: IPictures[] = [];
  public meta: IMeta = {pagination: {}};
  public dynamicMeta: IMeta = {pagination: {}};
  public shareMeta: IMeta = {pagination: {}};
  public positionPageNum: IFilter = {
    page: 1,
    limit: 12,
  };
  public dynamicPageNum: IFilter = {
    page: 1,
    limit: 3,
  };
  public pageNum: IFilter = {
    page: 1,
    limit: 10,
    companyId: ''
  };
  public editorContent = '';
  public editorConfig = {
    // theme: 'bubble',
    placeholder: "Please enter share content",
    modules: {
      toolbar: [
      ]
    }
  };
  public galleryOptions: NgxGalleryOptions[];
  public galleryOptions2: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];
  public iframe: SafeResourceUrl;
  public isEnterpriseLogin:boolean = false;
  public defChangeTabId: number = 1;
  public removeDynamicShow = false;
  constructor(private route: ActivatedRoute,
              private postService: PostService,
              private positionService: PositionService,
              private companyService: CompanyService,
              private userService:UserService,
              private auth: Auth,
              private router: Router,
              private chatService: ChatService,
              private welfareAwardsService: WelfareAwardsService,
              private toasterService: ToasterService,
              private translate: TranslateService,
              private sanitizer: DomSanitizer,
              private seoService: SeoService,
              private upgradeCompanyService: UpgradeCompanyService,
              private userPostService: UserPostService,
              private hotCompanyService: HotCompanyService,
              private location: Location) {

  }

  ngOnInit() {
    if (localStorage.getItem('role') === 'enterprise' && this.auth.isAuthenticated()) {
      this.isEnterpriseLogin = true;
      this.isShow = false;

    }
    if (localStorage.getItem('role') === 'user' && this.auth.isAuthenticated()) {
      this.isShow = true;
    }
    this.route.params.subscribe(
      (params) => {
        this.companyId = params['id'];
        this.pageNum.companyId = this.companyId;
        this.readFindCompany(params['id']);
        this.readNewsPosition(params['id']);
        this.readPicture(params['id']);
        this.readAwards(params['id']);
        this.readWelfare(params['id']);
        this.readCompanyBrowse(params['id']);
        this.readCompanyDynamic(params['id']);
        if (localStorage.getItem('role') === 'enterprise' && this.auth.isAuthenticated() &&
          localStorage.getItem('company') === this.companyId
        ) {
          this.removeDynamicShow = true;
        }
      }
    );
    this.pageNum.companyId = this.companyId;
    this.readCategories();
    this.readOtherPosition();
    // this.readUser();

    this.headList = [
      {
        id: 1,
        name: 'company.description'
      },
      {
        id: 2,
        name: 'enterprise.offer_job'
      },
      {
        id: 4,
        name: 'enterprise.company_share_interview'
      },
      {
        id: 5,
        name: 'enterprise.picture'
      }
    ];

    this.galleryOptions = [
      {
        width: '100%',
        height: '525px',
        thumbnailsColumns: 4,
        imageAnimation: "zoom"
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];

    this.galleryOptions2 = [
      {"thumbnails": false},
      {"breakpoint": 1920, "width": "100%", "height": "420px"}
    ];
   if (+localStorage.getItem('commentState') === 4) {
      this.changeTab(4);
    } else if (+localStorage.getItem('commentState') === 5) {
      this.changeTab(5);
    } else {
      this.changeTab(this.defChangeTabId);
    }
  }
  ngOnDestroy(): void {
    localStorage.removeItem('commentState');
  }
  setPositionState(): void {
    localStorage.setItem('positionState', 'clicked')
  }
  /*切换展开或收起*/
  toggleSpread(list: any): void {
    this.reviews.forEach((value) => {
      if (value.id === list.id) {
        list.experiencesShow = true;
      } else {
        value.experiencesShow = false;
      }
    });
  }
  toggleShare(list: any): void {
    this.dynamic.forEach((value) => {
      if (value.id === list.id) {
        list.show = true;
      } else {
        value.show = false;
      }
    });
  }

  changeTab(id: number) {
    this.headIndex = id;
    this.changeTabLoading = true;
    switch (id) {
      case 4:
        this.readReviews();
        break;
      case 5:
        this.readVideo(this.companyId);
        break;
    }
    setTimeout(() => {
      this.changeTabLoading = false;
    }, 1000)
  }

  async readCompanyBrowse(id: string): Promise<any> {
    try {
      await this.companyService.getCompanyClickNum(id).toPromise();
    } catch (err) {
    }
  }


  async readFindCompany(id: string): Promise<any> {
    try {
      this.companyLoading = true;
      let data = await this.hotCompanyService.find(id).toPromise();
      this.company = data;
      this.seoService.setTitle(this.company.name, this.seoService.getTitleContent());
      this.companyLoading = false;
    } catch (err) {
      this.companyLoading = false;
    }
  }

  async readCategories(): Promise<any> {
    try {
      let categories = await this.postService.getArticleCategoryTree({}).toPromise();
      categories.result = _.sortBy(categories.result, ['id', 'id']);
      for (let item of categories.result[0].children) {
        this.arr.push(item.id);
      }
      this.readNewsArticle();
    } catch (err) {
    }
  }

  async readNewsArticle(): Promise<any> {
    try {
      this.articleLoading = true;
      let data = await this.postService.get({'sorting': 'newest', 'limit': 5, 'categoryIds': this.arr}).toPromise();
      this.articles = data.result;
      this.articleLoading = false;
    } catch (err) {
      this.articleLoading = false;
    }
  }

  //加载分页
  async changePage(event: any) {
    this.positionPageNum.page = event.page;
    this.positionPageNum.limit = event.itemsPerPage;
    await this.readNewsPosition(this.companyId);
  }

  async readNewsPosition(companyId: string): Promise<any> {
    try {
      this.positionLoading = true;
      let data = await this.upgradeCompanyService.getCompanyPosition(companyId, this.positionPageNum).toPromise();
      this.meta = data.meta;
      this.position = data.result;
      this.positionLoading = false;
    } catch (err) {
      this.positionLoading = false;
    }
  }

  async readOtherPosition(): Promise<any> {
    try {
      this.otherPositionLoading = true;
      let data = await this.positionService.get({'sorting': 'newest', 'limit': 5}).toPromise();
      this.otherPosition = data.result;
      this.otherPositionLoading = false;
    } catch (err) {
      this.otherPositionLoading = false;
    }
  }


  //加载分页
  async changeDynamiPage(event: any) {
    this.dynamicPageNum.page = event.page;
    this.dynamicPageNum.limit = event.itemsPerPage;
    await this.readCompanyDynamic(this.companyId);
  }

  async readCompanyDynamic(companyId: string): Promise<any> {
    try {
      this.dynamicLoading = true;
      let data = await this.upgradeCompanyService.getCompanyDynamic(companyId, this.dynamicPageNum).toPromise();
      this.dynamicMeta = data.meta;
      this.dynamic = data.result;
      this.dynamicLoading = false;
    } catch (err) {
      this.dynamicLoading = false;
    }
  }
  // 删除指定id的公司动态
  async removeCompanyDynamic(id: string): Promise<any> {
    try {
      const ensure = confirm(this.translate.instant('message.dynamic_warn_msg'));
      if (ensure) {
        await this.upgradeCompanyService.deletedCompanyDynamic(this.companyId, id, this.dynamicPageNum).toPromise();
        await this.readCompanyDynamic(this.companyId);
      }
    } catch (err) {
    }
  }
  // 加载分页
  async changeReviewsPage(event: any) {
    this.pageNum.page = event.page;
    this.pageNum.limit = event.itemsPerPage;
    await this.readReviews();
  }

  async readReviews(): Promise<any> {
    try {
      this.reviewsLoading = true;
      let data = await this.upgradeCompanyService.getReviews(this.pageNum).toPromise();
      this.shareMeta = data.meta;
      this.reviews = data.result;
      this.reviewsLoading = false;
    } catch (err) {
      this.reviewsLoading = false;
    }
  }

  async postAnwer(): Promise<any> {
    try {
      let data = await this.upgradeCompanyService.postReviews({
        companyId: this.companyId,
        content: this.editorContent,
        isAnonymous: this.anonymous
      }).toPromise();
      this.reviews.push(data);
      this.postQa();
      this.editorContent = '';
      this.toasterService.pop('success', '', this.translate.instant('article.editorial_success_msg'));
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('message.you_need_an_interview_to_comment'));
    }

  }

  async postQa(): Promise<any> {
    try {
      await this.userPostService.store({
        title: `關於《${this.company.name}》面試分享`,
        companyId: this.companyId,
        categoryIds: [13],
        content: this.editorContent,
      }).toPromise();
    } catch (err) {
    }
  }

  async readWelfare(companyId: string) {
    try {
      this.welfareLoading = true;
      let data = await this.welfareAwardsService.getPublicWelfare(companyId).toPromise();
      if (data.result.length > 0) {
        this.welfare = data.result[data.result.length - 1].name.split(',');
      } else {
        this.welfare = [];
      }
      this.welfareLoading = false;
    } catch (err) {
      this.welfareLoading = false;
    }
  }

  async readAwards(companyId: string) {
    try {
      this.awardsLoading = true;
      let data = await this.welfareAwardsService.getPublicAwards(companyId).toPromise();
      this.awards = data.result;
      this.awardsLoading = false;
    } catch (err) {
      this.awardsLoading = false;
    }
  }

  async readVideo(id: string): Promise<any> {
    try {
      this.videoLoading = true;
      let data = await this.companyService.getVideo(id).toPromise();
      this.video = data.result[0];
      if (!_.isUndefined(this.video)) {
        this.iframe = this.sanitizer.bypassSecurityTrustResourceUrl(this.video.url);
      }
      this.videoLoading = false;
    } catch (err) {
    }
  }

  //加载图片
  async readPicture(id: string): Promise<any> {
    try {
      this.pictureLoading = true;
      let data = await this.companyService.getPublicCompanyPictures(id).toPromise();
      this.pictures = data;
      let arr = [];
      _.each(this.pictures, (value:any) => {
        arr.push({small: value.url['160'], medium: value.url['1024'], big: value.url['1024']});
      });
      this.galleryImages = arr;
      this.pictureLoading = false;
    } catch (err) {
      this.pictureLoading = false;
    }
  }



  async contact(): Promise<any> {
    if(this.auth.isAuthenticated() && localStorage.getItem('role') === 'user'){
      try {
        await this.userService.updateContent(this.companyId).toPromise();
        this.chatService.showChat(true);
      } catch (err) {

      }
    }else{
      this.router.navigate(['auth','login']);
    }
  }

}
