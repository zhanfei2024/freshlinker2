import {Component, OnInit, ViewChild, AfterViewChecked, HostListener, ElementRef} from '@angular/core';
import {ICompany, IStage, CompanyService, IScale} from "../service/company.service";
import {CountryService} from "../../user/country.service";
import {UserService} from "../../user/user.service";
import * as _ from "lodash";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ImageCropperComponent, CropperSettings} from 'ng2-img-cropper';
import {FileUploader} from "ng2-file-upload";
import {Config} from "../../../common/config/config";
import {ModalDirective} from "ngx-bootstrap";
import {SeoService} from "../../../common/global/seo";
import {SelectComponent} from "ng2-select";
import {ImgFileUploaderService} from "../../../common/global/img-file-uploader";
import {LocationStrategy} from "@angular/common";


@Component({
  templateUrl: './company-form.component.html',
})
export class CompanyFormComponent implements OnInit, AfterViewChecked {
  public countries: Array<any>;
  public country: any[];
  public saveLoading: boolean = false;
  public positionIndex: number = 1;
  public stages: IStage[] = [];
  public scale: IScale[] = [];
  public years: number[] = [];
  public myYear: number;
  private company: ICompany = {};
  public loading: boolean = false;
  public files: any[] = [];
  public files2: any[] = [];
  public covers: any[] = [];
  public companyId: string;
  public cover: string;
  public icon: string;
  public foundingTime: string;
  public isIconError: boolean = false;
  public back: any[];
  public data: any;
  public data2: any;
  public cropperSettings: CropperSettings;
  public cropperSettings2: CropperSettings;
  public uploader: FileUploader;


  @ViewChild('cropper') cropper: ImageCropperComponent;
  @ViewChild('cropper2') cropper2: ImageCropperComponent;
  @ViewChild('staticModal') staticModal: ModalDirective;
  @ViewChild('coverModal') coverModal: ModalDirective;
  @ViewChild('select') select: SelectComponent;
  @ViewChild('PostForm') form: ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  doSomething($event) {
    if (!_.isUndefined(this.form['value'].name) || !_.isUndefined(this.form['value'].background)
      || !_.isUndefined(this.form['value'].background) || !_.isUndefined(this.form['value'].background)
      || !_.isUndefined(this.form['value'].field) || !_.isUndefined(this.form['value'].scale)
      || !_.isUndefined(this.form['value'].stage) || !_.isUndefined(this.form['value'].field)) {
      $event['returnValue'] = 'Your data will be lost!';
    }
  }

  constructor(private userService: UserService,
              private countryService: CountryService,
              private route: ActivatedRoute,
              private router: Router,
              private toasterService: ToasterService,
              private config: Config,
              private seoService: SeoService,
              private locationStrategy:LocationStrategy,
              private translate: TranslateService,
              private imgFileUploaderService: ImgFileUploaderService,
              private companyService: CompanyService) {

  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('enterprise.apply_for_company'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    //Cropper settings
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 200;
    this.cropperSettings.height = 200;
    this.cropperSettings.keepAspect = false;
    this.cropperSettings.croppedWidth = 200;
    this.cropperSettings.croppedHeight = 200;
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

    //Cropper settings 2
    this.cropperSettings2 = new CropperSettings();
    this.cropperSettings2.width = 900;
    this.cropperSettings2.height = 215;
    this.cropperSettings2.keepAspect = false;
    this.cropperSettings2.croppedWidth = 900;
    this.cropperSettings2.croppedHeight = 215;
    this.cropperSettings2.canvasWidth = 900;
    this.cropperSettings2.canvasHeight = 215;
    this.cropperSettings2.minWidth = 100;
    this.cropperSettings2.minHeight = 100;
    this.cropperSettings2.rounded = false;
    this.cropperSettings2.minWithRelativeToResolution = false;
    this.cropperSettings2.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings2.cropperDrawSettings.strokeWidth = 2;
    this.cropperSettings2.noFileInput = true;
    this.data2 = {};
    this.years = this.userService.getYears();
    let myDate = new Date();
    this.myYear = myDate.getFullYear();
    this.stages = [
      {
        id: '1',
        value: 'public-company'
      },
      {
        id: '2',
        value: 'educational'
      },
      {
        id: '3',
        value: 'self-employed'
      },
      {
        id: '4',
        value: 'government-agency'
      },
      {
        id: '5',
        value: 'non-profit'
      },
      {
        id: '6',
        value: 'self-owned'
      },
      {
        id: '7',
        value: 'privately-held'
      },
      {
        id: '8',
        value: 'partnership'
      }
    ];
    this.scale = this.companyService.getCompanyScale();
    this.route.params.subscribe(
      (params) => {
        if (!_.isUndefined(params['id'])) {
          this.readCompany(params['id']);
          this.back = ['/company',params['id'],'dashboard'];
        } else {
          this.company.id = '';
          this.country = [{
            id: 99,
            text: 'Hong Kong'
          }];
          this.company.countryId = 99;
          this.company.icon = null;
          this.company.cover = null;
          this.company.url = 'http://';
          this.company.countryId = 99;
          let myDate = new Date();
          this.myYear = myDate.getFullYear();
          this.company.foundingTime = this.myYear - 5;
          this.loading = false;
          this.back = ['/company','select'];
        }
      });
    this.companyId = localStorage.getItem("company");
    this.readAllCountry();
  }

  fileChangeListener($event, type: string) {
    if (type === 'icon') {
      this.staticModal.show();
      let image: any = new Image();
      let file: File = $event.target.files[0];
      let myReader: FileReader = new FileReader();
      myReader.onloadend = (loadEvent: any) => {
        if (this.cropper) {
          this.cropper.setImage(image);
        }
        image.src = loadEvent.target.result;
      };
      myReader.readAsDataURL(file);
    } else if (type === 'cover') {
      this.coverModal.show();
      let image: any = new Image();
      let file: File = $event.target.files[0];
      let myReader: FileReader = new FileReader();
      myReader.onloadend = (loadEvent: any) => {
        if (this.cropper2) {
          this.cropper2.setImage(image);
        }
        image.src = loadEvent.target.result;
      };
      myReader.readAsDataURL(file);
    }
  }


  cropIcon(file: string) {
    this.files.push(this.imgFileUploaderService.dataURItoBlob(file));
    this.icon = file;
    this.staticModal.hide();
  }

  cropCover(file: string) {
    this.files2.push(this.imgFileUploaderService.dataURItoBlob(file));
    this.cover = file;
    this.coverModal.hide();
  }


  async readCompany(id: string): Promise<any> {
    if (!_.isUndefined(id)) {
      try {
        this.loading = true;
        let data = await this.companyService.getCompany(id).toPromise();
        this.company = data;
        this.readFindCountries(_.toString(this.company.countryId));
        this.loading = false;
      } catch (err) {
        this.loading = false;
      }
    }

  }


  async readAllCountry(): Promise<any> {
    try {
      let data = await this.countryService.get({}).toPromise();
      this.countries = this.itemsToFomart(data.result);
    } catch (err) {

    }
  }

  async readFindCountries(id: string): Promise<any> {
    try {
      let data = await this.countryService.find(id).toPromise();
      this.country = [{
        id: data.id,
        text: data.name
      }];
    } catch (err) {
    }
  }

  async searchCountry(value): Promise<any> {
    try {
      let data = await this.countryService.get({'search': value}).toPromise();
      this.countries = this.itemsToFomart(data.result);
    } catch (err) {
    }
  }

  public selectedCountry(value: any): void {
    this.company.countryId = value.id;
    this.company.countryId = _.toNumber(this.company.countryId);
  }


  public itemsToFomart(value: any): any {
    let tagItem = [];
    value.map((item: any) => {
      tagItem.push({id: `${item.id}`, text: `${item.name}`})

    });
    return tagItem;
  }

  // Add/edit company
  async save() {
    this.saveLoading = true;
    let funcName = this.company.id === '' ? 'store' : 'update';
    try {
      let data = await this.companyService[funcName](this.company).toPromise();
      if (this.files.length > 0) {
        await this.imgFileUploaderService.makeFileRequest(`${this.config.apiEndPoint}enterprise/companies/${data.id}/icon`, [], this.files);
      }
      if (this.files2.length > 0) {
        await this.imgFileUploaderService.makeFileRequest(`${this.config.apiEndPoint}enterprise/companies/${data.id}/cover`, [], this.files2);
      }
      this.router.navigate(['/company', 'select']);
      this.toasterService.pop('success', '', this.translate.instant('message.company_update_success_msg'));
      this.saveLoading = false;
    } catch (err) {
      this.saveLoading = false;
    }
  }

}
