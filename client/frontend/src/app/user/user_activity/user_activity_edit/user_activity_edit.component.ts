import {Component, OnInit, ViewChild, AfterViewChecked, HostListener, ElementRef} from '@angular/core';
import {IArticleCategory, IPost, UserPostService, Post} from "../../user_article/user_article.service";
import * as _ from "lodash";
import {Router, ActivatedRoute} from "@angular/router";
import {UserService} from "../../user.service";
import {ToasterService} from "angular2-toaster";
import {CropperSettings, ImageCropperComponent} from "ng2-img-cropper";
import {ModalDirective} from "ngx-bootstrap";
import {Config} from "../../../../common/config/config";
import {TranslateService} from "@ngx-translate/core";
import {SelectComponent} from "ng2-select";
import {SeoService} from "../../../../common/global/seo";
import {ImgFileUploaderService} from "../../../../common/global/img-file-uploader";


@Component({
  templateUrl: './user_activity_edit.component.html',
})
export class UserActivityEditComponent implements OnInit,AfterViewChecked {
  get files(): any {
    return this._files;
  }

  set files(value: any) {
    this._files = value;
  }
  public articleCategorySelected: any = [];
  public selectedArticleCategory: IArticleCategory[] = [];
  public selectedArticleCategoryIds: any = [];
  public categoryShow: boolean = true;
  public show: boolean = true;
  public category: any = [];
  public saveLoading: boolean = false;
  public upload: any;
  public companyId: string;
  public cover: string = "";
  public filesName: string;
  public selectedTags: any = [];
  public disabled = undefined;
  public categoryError: boolean = false;
  public items: Array<any>;
  public article: IPost;
  public loading: boolean = false;
  public cropperSettings: CropperSettings;
  public data: any;
  private _files: any = [];

  @ViewChild('select') select: SelectComponent;
  @ViewChild('cropper', undefined) cropper: ImageCropperComponent;
  @ViewChild('staticModal') staticModal: ModalDirective;
  @ViewChild('PostForm') form: ElementRef;
  @HostListener('window:beforeunload', ['$event'])
  doSomething($event) {
    if(!_.isUndefined(this.form['value'].content) || !_.isUndefined(this.form['value'].name)){
      $event['returnValue']='Your data will be lost!';
    }
  }
  constructor(private userPostService: UserPostService,
              private userService: UserService,
              private translate: TranslateService,
              private config: Config,
              private router: Router,
              private toasterService: ToasterService,
              private imgFileUploaderService: ImgFileUploaderService,
              private seoService: SeoService,
              private activatedRoute: ActivatedRoute) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('enterprise.activity'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    //Cropper settings
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 652;
    this.cropperSettings.height = 420;
    this.cropperSettings.keepAspect = false;
    this.cropperSettings.croppedWidth = 651;
    this.cropperSettings.croppedHeight = 421 ;
    this.cropperSettings.canvasWidth = 500;
    this.cropperSettings.canvasHeight = 300;
    this.cropperSettings.minWidth = 100;
    this.cropperSettings.minHeight = 100;
    this.cropperSettings.rounded = false;
    this.cropperSettings.minWithRelativeToResolution = false;
    this.cropperSettings.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings.cropperDrawSettings.strokeWidth = 2;
    this.cropperSettings.noFileInput = true;
    this.data = {};
    this.readCategory();
    this.loading = true;
    this.activatedRoute.data.subscribe((data: { activityFindResolve: Post }) => {

      this.article = !_.isUndefined(data.activityFindResolve) ? data.activityFindResolve : new Post();
      if(_.isUndefined(data.activityFindResolve)){
        this.article.url = "http://";
      }
      _.each(this.article.categories, (value: any) => {
        this.articleCategorySelected.push(value.id);
      });
      this.categoryShow = true;
      this.show = true;
      if (!_.isUndefined(this.article.tags)) {
        this.selectedTags = this.itemsToFomart(this.article.tags);
      }
      if (this.article.cover !== null && !_.isUndefined(this.article.cover)) {
        this.cover = this.article.cover.url['200'];
      }
      this.loading = false;
    });


    this.tagChanges();
  }

  fileChangeListener($event) {
    this.staticModal.show();
    let image: any = new Image();
    let file: File = $event.target.files[0];
    let myReader: FileReader = new FileReader();
    let that = this;
    myReader.onloadend = function (loadEvent: any) {
      image.src = loadEvent.target.result;
      that.cropper.setImage(image);
    };
    myReader.readAsDataURL(file);
  }

  cropIcon(file: string) {
    this._files.push(this.imgFileUploaderService.dataURItoBlob(file));
    this.cover = file;
    this.staticModal.hide();
  }



  async readCategory(): Promise<any> {
    try {
      let data = await this.userPostService.getArticleCategoryTree({}).toPromise();
      data.result = _.sortBy(data.result, ['id', 'id']);
      this.category = data.result[1].children;
      this.setSelectedArticleCategory(this.category);
    } catch (err) {
    }
  }


  async tagChanges(): Promise<any> {
    try {
      let data = await this.userService.getSkill({}).toPromise();
      this.items = this.itemsToFomart(data, 10);
    } catch (err) {
    }
  }

  async seachChanges(value): Promise<any> {
    try {
      let data = await this.userService.getSkill({search: value}).toPromise();
      this.select.items = this.itemsToFomart(data);
      this.select.open();
      if (data.length === 0) {
        let ids;
        if (this.items.length > 0) {
          ids = this.items[this.items.length - 1].id + 1;
        } else {
          ids = 1;
        }
        let arr = [];
        arr.push({id: ids, text: value});
        this.select.items = arr;
        this.select.open();
        this.select.ngOnInit();
      }
    } catch (err) {
    }
  }


  async tagChange(type: string): Promise<any> {
    if (type !== undefined) {
      this.seachChanges(type);
    }
  }

  public itemsToFomart(value: any, limit?: number): any {
    let tagItem = [];
    let newValue = value.slice(0, limit)
    newValue.map((item: any) => {
      tagItem.push({id: `${item.id}`, text: `${item.name}`})

    });
    return tagItem;
  }

  public itemsToString(value: Array<any> = []): any {
    return value
      .map((item: any) => {
        return {name: item.text};
      });
  }

  public refreshValue(value: any): void {
    this.article.tags = this.itemsToString(value);
  }

  // category
  setSelectedArticleCategory(item: any) {
    _.forEach(item, (value: any) => {
      value.selected = false;
      if (this.articleCategorySelected.indexOf(value.id) !== -1) {
        value.selected = true;
        this.selectedArticleCategory.push(value);
        this.selectedArticleCategoryIds.push(value.id);
      } else {
        value.selected = false;
      }
    });
    this.article.categoryIds = this.selectedArticleCategoryIds;
  }

  addSelectedArticleCategory(data: IArticleCategory) {
    let result = _.findIndex(this.selectedArticleCategory, {id: data.id});
    if (result === -1) {
      if (this.selectedArticleCategory.length < 5) {
        data['selected'] = true;
        this.selectedArticleCategory.push(data);
        this.selectedArticleCategoryIds.push(data.id);
      }
    } else {
      data['selected'] = false;
      this.selectedArticleCategory.splice(result, 1);
      this.selectedArticleCategoryIds.splice(result, 1);
    }
    this.article.categoryIds = this.selectedArticleCategoryIds;
    this.categoryError = false;
  }

  async post() {
    this.saveLoading = true;
    if (this.article.categoryIds === undefined || this.article.categoryIds.length === 0) {
      this.toasterService.pop('error', 'error',this.translate.instant('activity.activity_category_select_msg'));
      setTimeout(() => {
        this.saveLoading = false;
      }, 1000);

    } else if (this.article.tags === undefined || this.article.tags.length === 0) {
      this.toasterService.pop('error', 'error',this.translate.instant('article.activity_tag_input'));
      setTimeout(() => {
        this.saveLoading = false;
      }, 1000);
    } else if (this.article.url === 'http://') {
      this.toasterService.pop('error', 'error',this.translate.instant('article.article_url_input'));
      setTimeout(() => {
        this.saveLoading = false;
      }, 1000);
    } else if (this.article.content === null || _.isUndefined(this.article.content)) {
      this.toasterService.pop('error', 'error',this.translate.instant('article.activity_content_input_error_msg'));
      setTimeout(() => {
        this.saveLoading = false;
      }, 1000);
    } else {
      let funcName = _.isUndefined(this.article.id) ? 'store' : 'update';
      try {
        if (localStorage.getItem('postCompanyId')) {
          this.article.companyId = localStorage.getItem('postCompanyId')
        }
        let result = await this.userPostService[funcName](this.article).toPromise();
        this.saveLoading = false;
        if(this._files.length > 0){
          this.imgFileUploaderService.makeFileRequest(`${this.config.apiEndPoint}user/posts/${result.id}/cover`,[],this._files);
        }
        this.router.navigate(['/user', 'activity']);
        this.toasterService.pop('success', 'Success', this.translate.instant('message.artivity_publish_success_msg'));
      } catch (err) {
        this.toasterService.pop('error', 'error', this.translate.instant('message.artivity_url_error_msg'));
        this.saveLoading = false;
      }

    }

  }

}
