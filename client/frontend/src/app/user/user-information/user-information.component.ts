import {Component, OnInit, ViewChild, OnDestroy, AfterViewChecked, HostListener, ElementRef} from '@angular/core';
import {IUser, UserService} from "../user.service";
import {ISkill} from "../../position/position.service";
import {ICountry, CountryService} from "../country.service";
import * as moment from "moment";
import * as _ from "lodash";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {Config} from "../../../common/config/config";
import {CropperSettings, ImageCropperComponent} from "ng2-img-cropper";
import {ModalDirective} from "ngx-bootstrap";
import {SeoService} from "../../../common/global/seo";
import {INgxMyDpOptions, IMyDateModel} from "ngx-mydatepicker";
import {ImgFileUploaderService} from "../../../common/global/img-file-uploader";
import {NgxMyDatePickerConfig} from "ngx-mydatepicker/dist/services/ngx-my-date-picker.config";


@Component({
  templateUrl: './user-information.component.html',
  providers: [NgxMyDatePickerConfig]
})
export class UserInformationComponent implements OnInit, AfterViewChecked {
  public saveLoading: boolean = false;
  public skills: ISkill[] = [];
  public companyId: string;
  public user: IUser = {};
  public loading: boolean = false;
  public show: boolean = false;
  public countries: Array<any>;
  public company: Array<any>;
  public companyName: string;
  public selectedNationality: any;
  public country: ICountry;
  public events: any[];
  public yearOfExperience: any;
  public cropperSettings: CropperSettings;
  public data: any;
  public icon: string;
  public files: any[] = [];
  private value: any = {};


  // 日期控件
  public myOptions: INgxMyDpOptions = {
    // other options...
    dateFormat: 'yyyy-mm-dd',
  };
  @ViewChild('cropper', undefined) cropper: ImageCropperComponent;
  @ViewChild('staticModal') staticModal: ModalDirective;
  @ViewChild('PostForm') form: ElementRef;
  @ViewChild('dp1') DpInput: ElementRef;
  @HostListener('window:beforeunload', ['$event'])
  doSomething($event) {
    if(!_.isUndefined(this.form['value'].email) || !_.isUndefined(this.form['value'].firstName) || !_.isUndefined(this.form['value'].lastName) ||
    !_.isUndefined(this.form['value'].phone) || !_.isUndefined(this.form['value'].selfDescription) || !_.isUndefined(this.form['value'].yearOfExperience)) {
      $event['returnValue']='Your data will be lost!';
    }
  }

  constructor(private userService: UserService,
              private toasterService: ToasterService,
              private translate: TranslateService,
              private router: Router,
              private config: Config,
              private seoService: SeoService,
              private imgFileUploaderService: ImgFileUploaderService,
              private countryService: CountryService,
              private elementRef: ElementRef) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('user.profile.my_profile'), this.seoService.getTitleContent());
  }

  onDateChanged(event: IMyDateModel, type: string): void {
    this.user.birth = event.formatted;
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

    this.readUser();
    this.readCompany();
    this.readCountry();
  }
  // ngOnDestroy(): void {
  //   this.DpInput.nativeElement.closeCalendar();
  // }
  destroy(): void {
    this.DpInput.nativeElement.closeCalendar();
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
    this.files.push(this.imgFileUploaderService.dataURItoBlob(file));
    this.icon = file;
    this.staticModal.hide();
  }



  async readUser(): Promise<any> {

    try {
      this.loading = true;
      let data = await this.userService.find().toPromise();
      this.user = data;
      if(!_.isNull(this.user.birth)){
        let birth =_.split( moment(this.user.birth).format('YYYY-M-D'),'-',3);
        this.user.birth = { date: { year: birth[0], month: birth[1], day: birth[2] }};
      }
      if (_.isNull(this.user.nationalityId)) {
        this.user.nationalityId = 99;
      }
      this.yearOfExperience = this.userService.getExperience();
      if (_.isNull(this.user.yearOfExperience)) this.user.yearOfExperience = '0';
      if (_.isNull(this.user.gender)) this.user.gender = 'M';
      if (!_.isUndefined(this.user.nationalityId)) {
        this.readFindCountry(this.user.nationalityId.toString());
      }
      this.loading = false;
    } catch (err) {
      this.loading = false;
    }
  }

  async readCountry(): Promise<any> {
    try {
      let data = await this.countryService.get({}).toPromise();
      this.countries = this.itemsToFomart(data.result);
    } catch (err) {

    }
  }

  async readAllCountry(value): Promise<any> {
    try {
      let data = await this.countryService.get({'search': value}).toPromise();
      this.countries = this.itemsToFomart(data.result);
    } catch (err) {

    }
  }

  public refreshValue(value: any): void {
    this.value = value;
  }

  async readFindCountry(id: string): Promise<any> {
    try {
      let data = await this.countryService.find(id).toPromise();
      this.country = data;
      this.selectedNationality = [{id: this.country.id, text: this.country.name}];
    } catch (err) {

    }
  }

  public itemsToFomart(value: any): any {
    let tagItem = [];
    value.map((item: any) => {
      tagItem.push({id: item.id, text: item.name})
    });
    return tagItem;
  }


  public selectedCountry(value: any): void {
    this.user.nationalityId = value.id;
    this.readFindCountry(value.id);
  }

  public selectedCompany(value: any): void {
    this.companyName = value.text;
  }

  async readCompany(): Promise<any> {
    try {
      let data = await this.userService.getCompany({}).toPromise();
      this.company = this.itemsToFomart(data);
    } catch (err) {

    }
  }

  async typedCompany(value: any): Promise<any> {
    try {
      let data = await this.userService.getCompany({'search': value}).toPromise();
      this.company = this.itemsToFomart(data);
    } catch (err) {

    }
  }


  // save
  async save(): Promise<any> {
    this.saveLoading = true;
    if (this.user.skills.length !== 0) {
      this.skills = this.user.skills;
      this.user.skills = [];
      _.each(this.skills, (value) => {
        this.user.skills.push({name: value.name});
      });
    }
    if (this.companyName !== null && !_.isUndefined(this.companyName)) {
      this.applyCompany();
    }
    if(this.user.lastName.trim().length === 0){
      this.toasterService.pop('error','error',this.translate.instant('lastName is empty'));
      this.saveLoading = false;
    }else if(this.user.firstName.trim().length === 0){
      this.toasterService.pop('error','error',this.translate.instant('firstName is empty'));
      this.saveLoading = false;
    }else{
      try {
        this.user.birth = this.user.birth.formatted;
        let data = await this.userService.update(this.user).toPromise();
        data.birth = moment(data.birth).format('YYYY-MM-DD');
        this.saveLoading = false;
        this.toasterService.pop('success', 'Success', this.translate.instant('message.user_profile_person_update_success_msg'));
        if(this.files.length > 0){
          await this.imgFileUploaderService.makeFileRequest(`${this.config.apiEndPoint}user/users/self/icon`,[],this.files);
        }
        this.router.navigate(['/user', 'profile']);
      } catch (err) {
        this.saveLoading = false;
      }
    }
  }

  async applyCompany(): Promise<any> {
    try {
      await this.userService.applicantCompany({companyName: this.companyName}).toPromise();
    } catch (err) {

    }
  }





}
