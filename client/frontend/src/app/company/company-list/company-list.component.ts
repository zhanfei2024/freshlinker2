import {Component, OnInit, OnDestroy} from '@angular/core';
import {ICompany, CompanyService, IPictures, IPicture} from "../service/company.service";
import {IPost, IMeta, PostService} from "../../post/post.service";
import {IPosition, ITab, IFilter, PositionService} from "../../position/position.service";
import {UpgradeCompanyService} from "../../upgrade_company/upgrade_campany_service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../user/user.service";
import * as _ from "lodash";
import {NgxGalleryOptions, NgxGalleryImage} from 'ngx-gallery';
import {SeoService} from "../../../common/global/seo";
import {Auth} from "../../auth/auth.service";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {UserPostService} from "../../user/user_article/user_article.service";
import {getContentOfKeyLiteral} from "@angular/cli/lib/ast-tools";


@Component({
  templateUrl: './company-list.component.html',
  providers: [UserPostService]
})
export class CompanyListComponent implements OnInit, OnDestroy {
  public company: ICompany;
  public articles: IPost[];
  public companyId: string;
  public positions: IPosition[];
  public otherPositions: IPosition[];
  public dynamic: any;
  public reviews: any;
  public arr: Array<number> = [];
  public companyLoading: boolean;
  public articleLoading: boolean;
  public positionLoading: boolean;
  public newestPositionLoading: boolean;
  public otherPositionLoading: boolean;
  public headIndex: number = 1;
  public changeTabLoading: boolean;
  public companyPositions: IPosition[];
  public reviewsLoading: boolean;
  public anonymous: boolean;
  public experiencesShow = false;

  // company picture
  public loadPictures: IPicture[] = [];
  public pictures: IPictures[] = [];
  public pictureLoading: boolean = false;
  public isShow: boolean;
  public companyPictures: IPictures[] = [];
  public headList: ITab[] = [];
  public currentDate: Date;
  public meta: IMeta = {pagination: {}};
  public pictureMeta: IMeta = {pagination: {}};
  public shareMeta: IMeta = {pagination: {}};
  public galleryOptions2: NgxGalleryOptions[];
  public galleryOptions: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];
  public pageNum: IFilter = {
    page: 1,
    limit: 6,
  };

  public filter: IFilter = {
    page: 1,
    limit: 6,
  };
  public editorContent = `<p>Please enter share content</p>`;
  public editorConfig = {
    theme: 'bubble',
    placeholder: "输入任何内容，支持html",
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        [{'header': [1, 2, 3, 4, 5, 6, false]}],
        [{'color': []}, {'background': []}],
        [{'font': []}],
        [{'align': []}],
        ['link', 'image'],
        ['clean']
      ]
    }
  };

  constructor(private companyService: CompanyService,
              private route: ActivatedRoute,
              private upgradeCompanyService: UpgradeCompanyService,
              private positionService: PositionService,
              private toasterService: ToasterService,
              private translate: TranslateService,
              private seoService: SeoService,
              private router: Router,
              private auth: Auth,
              private userService: UserService,
              private userPostService: UserPostService,
              private postService: PostService) {

  }

  ngOnInit() {
    if (this.auth.isAuthenticated() && localStorage.getItem('role') === 'user') {
      this.isShow = true;
    } else {
      this.isShow = false;
    }

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
        id: 3,
        name: 'enterprise.picture'
      },
      {
        id: 4,
        name: 'enterprise.company_share_interview'
      }
    ];
    this.route.params.subscribe(
      (params) => {
        this.companyId = params['id'];
        this.readFindCompany(params['id']);
      }
    );
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

  }
  ngOnDestroy(): void {
    localStorage.removeItem('commentState');
  }
  /*内容展开收起切换*/
  moreShow(item: any): void {
    const idItem = item.id;
    _.forEach(this.reviews, (value) => {
      if (idItem === value.id) {
        item.showMore = this.experiencesShow;
      } else {
        item.showMore = !this.experiencesShow;
      }
    });
  }

  changeTab(id: number) {
    this.headIndex = id;
    this.changeTabLoading = true;
    switch (id) {
      case 1:
        // get pictures
        this.readPictures(this.companyId);
        setTimeout(() => {
          this.changeTabLoading = false;
        }, 1000);
        break;
      case 2:
        setTimeout(() => {
          this.changeTabLoading = false;
        }, 1000);
        break;
      case 3:
        setTimeout(() => {
          this.changeTabLoading = false;
        }, 1000);
        break;
      case 4:
        this.readReviews();
        setTimeout(() => {
          this.changeTabLoading = false;
        }, 1000);
        break;
    }
  }

  //加载分页
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
      this.toasterService.pop('success', '', this.translate.instant('article.editorial_success_msg'));
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('message.you_need_an_interview_to_comment'));
    }

  }

  async postQa(): Promise<any> {
    try {
       await this.userPostService.store({
        title: this.company.name + "发布了一条面试分享",
        companyId: this.companyId,
        categoryIds: [13],
        content: this.editorContent,
      }).toPromise();
    } catch (err) {
    }
  }

  async readPictures(id: string): Promise<any> {
    try {
      this.pictureLoading = true;
      let data = await this.companyService.getPictures(id).toPromise();
      this.pictures = data.result;
      let arr = [];
      _.each(this.pictures, (value) => {
        arr.push({small: value.url['160'], medium: value.url['1024'], big: value.url['1024']});
      });
      this.galleryImages = arr;
      this.pictureLoading = false;
    } catch (err) {
      this.pictureLoading = false;
    }
  }

  async readFindCompany(id: string): Promise<any> {
    try {
      this.companyLoading = true;
      let data = await this.companyService.find(id).toPromise();
      this.company = data;
      if (this.company.isApproved) {
        this.seoService.setTitle(this.company.name, this.seoService.getTitleContent());
        this.readCompanyBrowse(this.company.id);
        this.readNewsPosition(this.company.id);
        this.readCompanyPosition(this.companyId);
        this.changeTab(1);
        this.readCategories();
        this.readOtherPosition();
      } else {
        this.router.navigate(['/company', this.company.id, 'prompt']);

      }

      this.companyLoading = false;
    } catch (err) {
      this.companyLoading = false;
    }
  }

  async readCompanyBrowse(id: string): Promise<any> {
    try {
      await this.companyService.getCompanyClickNum(id).toPromise();
    } catch (err) {
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
    this.pageNum.page = event.page;
    this.pageNum.limit = event.itemsPerPage;
    await this.readCompanyPosition(this.companyId);
  }

  async readNewsPosition(companyId: string): Promise<any> {
    try {
      this.newestPositionLoading = true;
      let data = await this.upgradeCompanyService.getCompanyPosition(companyId, {
        'sorting': 'newest',
        'limit': 5
      }).toPromise();
      this.positions = data.result;
      this.newestPositionLoading = false;
    } catch (err) {
      this.newestPositionLoading = false;
    }
  }

  async readOtherPosition(): Promise<any> {
    try {
      this.otherPositionLoading = true;
      let data = await this.positionService.get({'sorting': 'newest', 'limit': 5}).toPromise();
      this.otherPositions = data.result;
      this.otherPositionLoading = false;
    } catch (err) {
      this.otherPositionLoading = false;
    }
  }

  async readCompanyPosition(companyId: string): Promise<any> {
    try {
      this.positionLoading = true;
      let positions: IPosition[] = [];
      let data = await this.upgradeCompanyService.getCompanyPosition(companyId, this.pageNum).toPromise();
      if (data.result.length !== 0) {
        _.each(data.result, (value: any) => {
          value['isExpired'] = this.userService.checkExpired(value.expiredDate, this.currentDate);
          if (!value['isExpired']) {
            positions.push(value);
          }
        });
        this.companyPositions = positions;
      } else {
        this.companyPositions = data.result;
      }
      this.meta = data.meta;
      this.positionLoading = false;
    } catch (err) {
      this.positionLoading = false;
    }
  }


}
