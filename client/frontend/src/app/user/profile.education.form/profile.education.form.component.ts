import {Component, OnInit, Input, OnChanges, ViewChild, AfterViewChecked,} from '@angular/core';
import * as _ from "lodash";
import * as moment from "moment";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {Education, UserEducationService, ISchool, IEducation} from "./profile.education.service";
import {Experience} from "../profile.experience.form/profile.experience.service";
import {IEducationLevel} from "../../../common/service/education_level.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SelectComponent} from "ng2-select";
import {SeoService} from "../../../common/global/seo";


@Component({
  templateUrl: './profile.education.form.component.html',
  providers: []
})
export class ProfileEducationFormComponent implements OnInit,AfterViewChecked {
  public saveLoading: boolean = false;
  public graduationYears: number[] = [];
  public myYear: number;
  public selectSchool: any = [];
  public educationLevel: IEducationLevel;
  public gpaError: boolean = false;
  public selfDescriptionLength: number;

  public school: ISchool;
  public schools: Array<any>;
  public schoolLoading: boolean = false;
  public schoolErrorShow: boolean = false;
  public education: any = {
    subject: ''
  };

  @ViewChild('select') select: SelectComponent;
  constructor(private userEducationService: UserEducationService,
              private toasterService: ToasterService,
              private route: ActivatedRoute,
              private router: Router,
              private seoService: SeoService,
              private translate: TranslateService) {
  }


  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('user.profile.education'),this.seoService.getTitleContent());
  }

  ngOnInit() {
    let footer = document.getElementsByClassName('footer');
    let navbar = document.getElementsByClassName('navbar');
    footer[0]['style'].display = 'none';
    navbar[0]['style'].display = 'none';
    this.route.params.subscribe(
      (params) => {
        if (!_.isUndefined(params['id'])) {
          this.readEducation(params['id']);
        } else {
          this.education = new Education();
          if (_.isUndefined(this.education.id)) {
            this.education.graduationYear = this.myYear - 5;
            this.education.educationLevelId = 6;
          }
        }
      }
    );
    this.graduationYears = this.userEducationService.getYears();
    let myDate = new Date();
    this.myYear = myDate.getFullYear();
    this.readEducationLevel();
    this.readSchools();
  }

  async readEducation(id: string): Promise<any> {
    try {
      let data = await this.userEducationService.find(id).toPromise();
      this.education = data;
      this.selectSchool = [{
        id: this.education.school.id,
        text: this.education.school.name
      }];
      if (!_.isUndefined(this.education.schoolId)) {
        this.readFindSchools();
      }
    } catch (err) {
    }
  }


  async readEducationLevel(): Promise<any> {
    try {
      let data = await this.userEducationService.getEducationlevels({}).toPromise();
      this.educationLevel = data.result;
    } catch (err) {
    }
  }

  async readSchools(): Promise<any> {
    try {
      let data = await this.userEducationService.getSchools({}).toPromise();
      this.schools = this.itemsToFomart(data.result);
    } catch (err) {
    }
  }

  public selectedSchools(value: any): void {
    this.education.schoolId = _.toNumber(value.id);
  }

  async readFindSchools(): Promise<any> {
    try {
      this.schoolLoading = true;
      let data = await this.userEducationService.findSchools(this.education.schoolId).toPromise();
      this.school = data;
      this.schoolLoading = false;
    } catch (err) {
      this.schoolLoading = false;
    }
  }
  restGpa(value: number): void {
    if (value >= 5) {
      this.education.gpa = 5;
    }
  }
  gpaInput() {
    if (_.isNaN(parseInt(this.education.gpa, 10))) {
      this.gpaError = true;
    } else if (this.education.gpa > 5 || this.education.gpa < 0) {
      this.toasterService.pop('error', '', this.translate.instant('message.gpa_input_message'));
    } else {
    }
  }


  async searchSchools(value): Promise<any> {
    try {
      let data = await this.userEducationService.getSchools({'search': value}).toPromise();
      this.schools = this.itemsToFomart(data.result);
      this.select.open();
    } catch (err) {
    }
  }


  public itemsToFomart(value: any): any {
    let tagItem = [];
    value.map((item: any) => {
      tagItem.push({id: `${item.id}`, text: `${item.name}`})

    });
    return tagItem;
  }


  schoolSelect() {
    if (!_.isUndefined(this.school)) {
      this.schoolErrorShow = false;
      this.education.schoolId = _.toNumber(this.school.id);
    } else {
      this.schoolErrorShow = true;
      if (this.saveLoading) {
        setTimeout(() => {
          this.saveLoading = false;
        }, 500);
      }
    }
  }

  // save
  async save() {
    this.saveLoading = true;
    if (!this.schoolErrorShow) {
      if (!this.gpaError) {
        if (this.selfDescriptionLength > 3000) {
          this.toasterService.pop('error', '', this.translate.instant('message.text_input_255_words_message'));
          this.saveLoading = false;
        } else {
          let funcName = _.isUndefined(this.education.id) ? 'store' : 'update';
          try {
            this.education.educationLevelId = _.toNumber(this.education.educationLevelId);
            this.education.graduationYear = _.toNumber(this.education.graduationYear);
            let data = await this.userEducationService[funcName](this.education).toPromise();
            this.toasterService.pop('success', '', this.translate.instant(data.id === '' ? 'message.user_profile_education_create_success_msg' : 'message.user_profile_education_update_success_msg'));
            this.saveLoading = false;
            this.router.navigate(['/user', 'profile']);
          }
          catch (err) {
            this.toasterService.pop('warning', 'Warning', err);
            this.saveLoading = false;
          }
        }
      } else {
        setTimeout(() => {
          this.saveLoading = false;
        }, 500);

      }
    }
  }

}
