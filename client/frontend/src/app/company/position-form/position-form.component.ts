import {Component, OnInit, ViewChild, AfterViewChecked, HostListener, ElementRef} from '@angular/core';
import {
  IUser,
  IEducationLevel,
  ICategory,
  ICompany,
  IJobNature,
  PositionService
} from "../../position/position.service";
import {IPositionCategory, PositionCategoryService} from "../../position_category/position_category.service";
import {DashboardService} from "../company-dashboard/company-dashboard.service";
import * as _ from "lodash";
import {UserService, IExperience} from "../../user/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {Position, CompanyPositionService} from "../service/company-position.service";
import {LocationService, ILocation} from "../../../common/service/location.service";
import {PositionQuestionService} from "../../position/position.question.service";
import {ModalDirective} from "ngx-bootstrap";
import {SelectComponent} from "ng2-select";
import {SeoService} from "../../../common/global/seo";


export interface IQuestion {
  id: string;
  question: string;
  isRequired: boolean,
  isAttachment: boolean,
  deleted: boolean,

}


@Component({
  templateUrl: './position-form.component.html',
})
export class PositionFormComponent implements OnInit,AfterViewChecked {
  public user: Array<IUser>;
  public education: IEducationLevel;
  // category
  public positionCategorySelected: any = [];
  public positionCategoryChildren: IPositionCategory[] = [];
  public selectedPositionCategory: IPositionCategory[] = [];
  public selectedPositionCategoryIds: any = [];
  public categoryShow: boolean = true;
  public categoryIds: ICategory[];

  // location
  public positionLocationSelected: any = [];
  public positionLocationChildren: IPositionCategory[] = [];
  public selectedPositionLocation: IPositionCategory;
  public locationShow: boolean = true;


  // question
  public positionQuestion: IQuestion[] = [];
  public num: number = 0;
  public positionQuestionShow: boolean = false;

  public welfare: string;

  public company: ICompany;
  public companyId: string;
  public position: Position;
  public positionCategories: IPositionCategory[];
  public locations: ILocation[];
  public jobNatures: IJobNature[];
  public experience: IExperience[];
  public educations: IEducationLevel;
  public skills: Array<any>;
  public temptation: Array<string> =
    ['Dental insurance ', 'Double pay', 'Education allowance', 'Five-day work week',
      'Flexible working hours', 'Free shuttle bus', 'Gratuity', 'Housing allowance','Travel allowance', 'Work from home', 'Life insurance', 'Medical insurance', 'Overtime pay',
      'Performance bonus', 'Transportation allowance'];
  public previewTemptation: any[];

  // preview
  public isPreview: boolean = false;
  public isActiveShow: boolean = true;
  public educationLevelName: string;
  public jobNatureName: string;
  public disabled: undefined;
  public contentError: boolean = true;
  public show: boolean = false;
  public salaryType: any;
  public negotiable: boolean = false;
  public tableLoading: boolean = false;
  public saveLoading: boolean = false;
  public isShow: boolean = false;
  public message: string;
  public currentDate: Date = new Date();
  public expiredPosition: boolean = false;
  public selectedSkill: any = [];
  public selectedTemptation: any = [];
  @ViewChild('PostForm') form: ElementRef;
  @HostListener('window:beforeunload', ['$event'])
  doSomething($event) {
    if(!_.isUndefined(this.form['value'].name) || this.form['value'].description !== ''
      || !_.isUndefined(this.form['value'].email) || !_.isUndefined(this.form['value'].location)
      || !_.isUndefined(this.form['value'].address)) {
      $event['returnValue']='Your data will be lost!';
    }
  }
  @ViewChild('childModal') public childModal: ModalDirective;
  @ViewChild('select') select: SelectComponent;
  constructor(private dashboardService: DashboardService,
              private userService: UserService,
              private companyPositionService: CompanyPositionService,
              private positionCategoryService: PositionCategoryService,
              private positionQuestionService: PositionQuestionService,
              private locationService: LocationService,
              private positionService: PositionService,
              private route: ActivatedRoute,
              private router: Router,
              private toasterService: ToasterService,
              private seoService: SeoService,
              private translate: TranslateService) {

  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('enterprise.position_management'),this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.companyId = localStorage.getItem('company');
    this.readCompany();
    this.tableLoading = true;

    this.route.data.subscribe((data: { positionFormFindResolveL: Position }) => {
      this.position = !_.isUndefined(data.positionFormFindResolveL) ? data.positionFormFindResolveL : new Position();
      if (!_.isUndefined(this.position.id)) {
        _.each(this.position.categories, (value: any) => {
          this.positionCategorySelected.push(value.id);
        });
        if (!_.isUndefined(this.position.skills)) {
          this.selectedSkill = this.itemsToFomart(this.position.skills);
        }
        if (!_.isUndefined(this.position.temptation) && !_.isNull(this.position.temptation)) {
          this.selectedTemptation = this.position.temptation.split(',');
        }
        if (this.position.minSalary === 0 && this.position.maxSalary === 0) this.negotiable = true;
        if (new Date > this.position.expiredDate) {
          this.expiredPosition = true;
        }
        this.isActiveShow = this.position.active;
        this.readQuestion(this.position.companyId, this.position.id);
      } else {
        this.position.salaryType = 'monthly';
        this.position.type = 'full-time';
        this.position.active = true;
        this.position.educationLevelId = 6;
        this.position.experience = '0';
        this.position.minSalary = 0;
        this.position.maxSalary = 0;
        this.position.jobNatureId = 1;
        this.position.description = '';
      }
      this.tableLoading = false;
    });

    this.readPositionCategories();
    this.readJobNatures();
    this.readPositionLocations();
    this.readEducations();
    this.experience = this.userService.getExperience();
    this.tagChanges();
  }
  /*职位描述状态变化*/
  onContentChanged($event): void {
    const patrn = /\s+/g;
    if (patrn.test($event.html)) {
       this.contentError = true;
    } else {
      this.contentError = false;
    }
  }

  //加载公司
  async readCompany(): Promise<any> {
    try {
      let data = await this.dashboardService.findCompany(localStorage.getItem('company')).toPromise();
      this.company = data.result;
    } catch (err) {
    }
  }

  //加载职位类型
  async readPositionCategories(): Promise<any> {
    try {
      let data = await this.positionCategoryService.getPositionCategory().toPromise();
      this.positionCategories = _.sortBy(data.result, [function(o) { return o.name; }]);
      if (!_.isUndefined(this.position.id)) {
        this.setSelectedPositionCategory(this.positionCategories, null);
      } else {
        // // 默认展开第一个分类
        this.togglePositionCategory(_.head(this.positionCategories));
      }
    } catch (err) {
    }
  }


  //加载地区
  async readPositionLocations(): Promise<any> {
    try {
      let data = await this.locationService.getLocationTree().toPromise();
      this.locations = data.result;
      if (!_.isUndefined(this.position.id)) {
        this.setSelectedPositionLocation(this.locations, null);
      } else {
        // 默认展开第一个地址
        this.togglePositionLocation(_.head(this.locations));
      }
    } catch (err) {
    }
  }




  //加载工作性质
  async readJobNatures(): Promise<any> {
    try {
      let data = await this.positionService.getjobNatures().toPromise();
      this.jobNatures = data.result;
    } catch (err) {
    }
  }

  //加载教育
  async readEducations(): Promise<any> {
    try {
      let data = await this.userService.getEducation().toPromise();
      this.education = data;
    } catch (err) {
    }
  }

  //加载问题
  async readQuestion(companId: string, id: string): Promise<any> {
    try {
      let data = await this.positionQuestionService.get(companId, id).toPromise();
      _.each(data.result, (value: any) => {
        this.positionQuestion.push({
          id: value.id,
          question: value.question,
          isRequired: value.isRequired,
          isAttachment: value.isAttachment,
          deleted: false
        });
      });
      this.positionQuestionShow = true;
    } catch (err) {
    }
  }


  async tagChanges(): Promise<any> {
    try {
      let data = await this.userService.getSkill({}).toPromise();
      this.skills = this.itemsToFomart(data);
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
        if(this.skills.length>0){
          ids = this.skills[this.skills.length - 1].id + 1;
        }else{
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


  public refreshValue(value: any, type: string): void {
    switch (type) {
      case 'tags':
        this.selectedSkill = this.itemsToString(value, true);
        this.position.skills = this.itemsToStrings(value);
        break;
      case 'temptation':
        this.position.temptation = this.itemsToString(value, false);
        this.selectedTemptation = this.position.temptation;
        this.position.temptation = this.position.temptation.toString();
        break;
    }
  }


  // category
  setSelectedPositionCategory(children: any, parent: any) {
    _.forEach(children, (child: any) => {
      child.selected = false;
      child.parent = parent;
      if (this.positionCategorySelected.indexOf(child.id) !== -1) {
        child.selected = true;
        this.selectedPositionCategory.push(child);
        this.selectedPositionCategoryIds.push(child.id);
        if (!_.isUndefined(parent) && !_.isNull(parent)) {
          this.togglePositionCategory(child.parent);
        }
      } else {
        child.selected = false;
      }
      if (!_.isUndefined(child.children)) this.setSelectedPositionCategory(child.children, child);
    });
    this.position.categoryIds = this.selectedPositionCategoryIds;
  }


  togglePositionCategory(data: any) {
    if (!_.isUndefined(data.children)) {
      _.each(this.positionCategories, (value: any) => {
        if (_.isEqual(value, data)) {
          data.selected = true;
        } else {
          value['selected'] = false;
        }
      });
      this.positionCategoryChildren = _.sortBy(data.children, [function(o) { return o.name; }]);
    }

  }

  addSelectedPositionCategory(data: any) {
    let result = _.findIndex(this.selectedPositionCategory, {id: data.id});
    if (result === -1) {
      if (this.selectedPositionCategory.length < 5) {
        data['selected'] = true;
        this.selectedPositionCategory.push(data);
        this.selectedPositionCategoryIds.push(data.id);
      }
    } else {
      data['selected'] = false;
      this.selectedPositionCategory.splice(result, 1);
      this.selectedPositionCategoryIds.splice(result, 1);
      this.categoryShow = true;
    }
    this.position.categoryIds = this.selectedPositionCategoryIds;
  }

  // location
  togglePositionLocation(data: any) {
    if (!_.isUndefined(data.children)) {
      _.each(this.locations, (value: any) => {
        if (_.isEqual(value, data)) {
          data.selected = true;
        } else {
          value['selected'] = false;
        }
      });
      this.positionLocationChildren = data.children;
    }
  }

  addSelectedPositionLocation(data: any) {
    this.selectedPositionLocation = data;
  }

  setSelectedPositionLocation(children: any, parent: any) {
    _.forEach(children, (child: any) => {
      child.parent = parent;
      if (this.positionLocationSelected.id === child.id) {
        child.selected = true;
        this.selectedPositionLocation = child;
        if (!_.isUndefined(parent) && !_.isNull(parent)) {
          this.togglePositionLocation(child.parent);
        }
      } else {
        child.selected = false;
      }
      if (!_.isUndefined(child.children)) this.setSelectedPositionLocation(child.children, child);
    });
  }

  // 是否面议
  isNegotiable(isNegotiable: boolean) {
    if (!isNegotiable) {
      this.position.salaryType = 'monthly';
    } else {
      this.position.minSalary = 0;
      this.position.maxSalary = 0;
    }
  }

  // 添加问题
  async addQuestion() {
    this.num = this.num + 1;
    this.positionQuestionShow = true;
     this.positionQuestion.push({id: '', question: '', isRequired: false, deleted: false, isAttachment: false});
  }

  // 删除问题
  deleteQuestion(index: number) {
    if (this.positionQuestion[index].id !== "") {
      this.positionQuestion[index].deleted = true;
    } else {
      this.positionQuestion.splice(index, 1);
    }
  }

  // 重新上线
  async backOnlinePosition() {
    try {
      await this.companyPositionService.backOnlinePosition(this.companyId, this.position.id, {active: true}).toPromise();
      this.toasterService.pop('success', '', this.translate.instant('message.back_online_success_msg'));
      this.router.navigate(['/company', this.companyId, 'position-list']);
    } catch (err) {
      switch (err.code) {
        case 18003:
          this.toasterService.pop('error', '', this.translate.instant('message.active_jobs_account_insufficient_quantity_error_msg'));
          break;
        case 404:
          this.toasterService.pop('error', '', this.translate.instant('enterprise.postPosition'));
          break;
      }
    }
  }



  //执行发布职位
  async save() {
    if (!this.isPreview) {
      if (this.position.categoryIds === undefined || this.position.categoryIds.length === 0) {
        this.toasterService.pop('error', 'err', this.translate.instant('message.category_input_msg'));
      } else if (this.position.name === undefined || this.position.name === '') {
        this.toasterService.pop('error', 'err', this.translate.instant('message.position_name_input'));
      } else if (this.position.email === undefined || this.position.email === '') {
        this.toasterService.pop('error', 'err', this.translate.instant('message.position_email_input'));
      } else if (this.position.locationId === undefined) {
        this.toasterService.pop('error', 'err', this.translate.instant('message.location_input_msg'));
      } else if (this.position.description === '' || _.isUndefined(this.position.description)) {
        this.contentError = false;
        this.toasterService.pop('error', 'err', this.translate.instant('message.position_content_error_message'));
        setTimeout(() => {
          this.saveLoading = false;
        }, 1000);

      } else {
        this.post();
      }
    }
  }

  //添加发布请求
  async post() {
    try {
      this.saveLoading = true;
      let funcName = _.isUndefined(this.position.id) ? 'store' : 'update';
      let data = await this.companyPositionService[funcName](localStorage.getItem('company'), this.position).toPromise();
      this.position = data;
      if (this.positionQuestion.length !== 0) {
        _.each(this.positionQuestion, (value) => {
          if (value.id === "" && value.deleted === false) this.readPositionQuestion(value);
          if (value.id !== "" && value.deleted === false) this.updatePositionQuestion(value);
          if (value.id !== "" && value.deleted === true) this.deletePositionQuestion(value);
        });
      }
      this.toasterService.pop('success', '', this.translate.instant(this.position.id === '' ? 'message.company_position_create_success_msg' : 'message.company_position_update_success_msg'));
      this.saveLoading = false;
      this.router.navigate(['/company', localStorage.getItem('company'), 'position-list']);
    } catch (err) {
      switch (err.code) {
        case 18003:
          this.isShow = true;
          this.message = this.translate.instant('message.active_jobs_account_insufficient_quantity_error_msg');
          break;
        case 18006:
          this.toasterService.pop('error', '', this.translate.instant('message.purchase_plan_to_publish_position'));
          this.router.navigate(['/company/pricing']);
      }
      this.saveLoading = false;
    }
  }

  //添加问题请求
  async readPositionQuestion(value: any): Promise<any> {
    try {
      await this.positionQuestionService.store(this.position.companyId, this.position.id, value).toPromise();
    } catch (err) {
    }
  }

  //更新问题请求
  async updatePositionQuestion(value: any): Promise<any> {
    try {
      let data = await this.positionQuestionService.update(this.position.companyId, this.position.id, value.id, value).toPromise();
      let index = _.findIndex(data.result, {id: value.id});
      this.positionQuestion[index] = data.result;
    } catch (err) {
    }
  }

  //删除问题请求
  async deletePositionQuestion(value: any): Promise<any> {
    try {
      await this.positionQuestionService.delete(this.position.companyId, this.position.id, value.id).toPromise();
    } catch (err) {
    }
  }


  // 职位预览
  preview() {
    this.isPreview = !this.isPreview;
    // add data
    switch (this.position.educationLevelId) {
      case 1:
        this.educationLevelName = 'master';
        break;
      case 2:
        this.educationLevelName = 'post_graduate';
        break;
      case 3:
        this.educationLevelName = 'degree';
        break;
      case 4:
        this.educationLevelName = 'college';
        break;
      case 5:
        this.educationLevelName = 'school_certificate';
        break;
      case 6:
        this.educationLevelName = 'any';
        break;
    }

    switch (this.position.jobNatureId) {
      case 1:
        this.jobNatureName = 'Admin – Oriented';
        break;
      case 2:
        this.jobNatureName = 'Analytical – Oriented';
        break;
      case 3:
        this.jobNatureName = 'Creative - Oriented';
        break;
      case 4:
        this.jobNatureName = 'Management - Oriented';
        break;
      case 5:
        this.jobNatureName = 'People – Oriented';
        break;
      case 6:
        this.jobNatureName = 'R&D – Oriented';
        break;
      case 7:
        this.jobNatureName = 'Tech – Oriented';
        break;
    }
    this.previewTemptation = this.position.temptation.split(',');
  }

  //保存草稿
  draft() {
    this.position.active = false;

  }

  //不保存草稿
  noDraft() {
    this.position.active = true;
  }


   itemsToFomart(value: any): any {
    let tagItem = [];
    if (typeof value === 'string') {
      let valueItem = value.split(',');
      _.forEach(valueItem, (key, val) => {
        tagItem.push({id: key, text: val})
      });
    } else {
      value.map((item: any) => {
        tagItem.push({id: item.id, text: item.name})
      });
    }
    return tagItem;
  }

  itemsToStrings(value: Array<any> = []): any{
    return value
      .map((item: any) => {
        return {name: item.text};
      });
  }

   itemsToString(value: Array<any> = [], isObject: boolean): any {
    if (isObject) {
      return value
        .map((item: any) => {
          return {text: item.text};
        });
    } else {
      return value
        .map((item: any) => {
          return item.text;
        });
    }
  }


}
