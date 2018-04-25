import {Component, ViewChild, OnInit, Input, AfterViewChecked} from "@angular/core";
import {IUser, UserService} from "../user.service";
import * as moment from "moment";
import * as _ from "lodash";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";
import {UserExperienceService, Experience} from "../profile.experience.form/profile.experience.service";
import {UserEducationService} from "../profile.education.form/profile.education.service";
import {UserLanguageService} from "../profile.language.form/profile.language.service";
import {SelectComponent} from "ng2-select";
import {SeoService} from "../../../common/global/seo";


@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
})

export class ProfileComponent implements OnInit,AfterViewChecked {

  public user: IUser;
  public experience: Experience;
  public url: string;
  public expectShow: any ={};
  public educationsShow: any ={};
  public experiencesShow: any ={};
  public loading: boolean = false;
  public skillShow: boolean = false;
  public gender: boolean;
  public name: string;
  public skills: Array<any>;
  public selectSkills: Array<any>;
  @ViewChild('select') select: SelectComponent;

  public constructor(private userService: UserService,
                     private toasterService: ToasterService,
                     private userExperienceService: UserExperienceService,
                     private userLanguageService: UserLanguageService,
                     private userEducationService: UserEducationService,
                     private seoService: SeoService,
                     private translate: TranslateService,) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('user.profile.my_resume'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    let footer = document.getElementsByClassName('footer');
    let navbar = document.getElementsByClassName('navbar');
    footer[0]['style'].display = 'block';
    navbar[0]['style'].display = 'block';
    this.readUser();
    this.tagChanges();
  }

  async readUser(): Promise<any> {
    try {
      this.loading = true;
      let data = await this.userService.find({}).toPromise();
      this.user = data;
      if (this.user.expectJobs.length > 0) {
        this.url = `/user/expectJobs/${this.user.expectJobs[0].id}/edit`;
      } else {
        this.url = `/user/expectJobs/edit`;
      }
      if (this.user.experiences.length > 0) {
        _.each(this.user.experiences, (val:any) => {
          val.startedDate = moment(val.startedDate).toDate();
          if (val.endedDate !== 'toDate') {
            val.endedDate = moment(val.endedDate).toDate();
          }
        });
      }

      if (this.user.skills.length > 0) {
        this.selectSkills = this.itemsToFomart(this.user.skills);
      }

      switch (this.user.gender) {
        case 'F':
          this.user.gender = 'global.female';
          this.gender = false;
          break;
        case 'M':
          this.user.gender = 'global.male';
          this.gender = true;
          break;
      }

      this.name = this.user.firstName + ' ' + this.user.lastName;
      if (this.user.languages.length > 0) {
        _.each(this.user.languages, (value:any) => {
          switch (value.UserLanguage.level) {
            case 'professional_working':
              value.UserLanguage.level = 'Good';
              break;
            case 'elementary':
              value.UserLanguage.level = 'Limited';
              break;
            case 'limited_working':
              value.UserLanguage.level = 'Basic';
              break;
            case 'full_professional':
              value.UserLanguage.level = 'Professional';
              break;
            case 'native':
              value.UserLanguage.level = 'Native';
              break;
          }
        });
      }

      this.loading = false;
    } catch (err) {
      this.loading = false;
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
        if (this.skills.length > 0) {
          ids = this.skills[this.skills.length - 1].id + 1;
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

  public refreshValue(value: any, type: string): void {
    switch (type) {
      case 'tags':
        this.selectSkills = this.itemsToString(value, true);
        this.user.skills = this.itemsToStrings(value);
    }
  }

  public itemsToFomart(value: any): any {
    let tagItem = [];
    value.map((item: any) => {
      tagItem.push({id: `${item.id}`, text: `${item.name}`})

    });
    return tagItem;
  }

  public itemsToStrings(value: Array<any> = []): any {
    return value
      .map((item: any) => {
        return {name: item.text};
      });
  }

  public itemsToString(value: Array<any> = [], isObject: boolean): any {
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


  async saveSkill(): Promise<any> {
    try {
      let data = await this.userService.store({skills: this.user.skills}).toPromise();
      this.user.skills = data.skills;
      this.selectSkills = this.itemsToFomart(this.user.skills);
      this.toasterService.pop('success', '', this.translate.instant('message.user_profile_skill_update_success_msg'));
    } catch (err) {

    }
  }


  // delete user experience
  async removeExperience(id: number): Promise<any> {
    try {
      await this.userExperienceService.delete(id).toPromise();
      let index = _.findIndex(this.user.experiences, {id: id});
      if (index !== -1) this.user.experiences.splice(index, 1);
      this.toasterService.pop('success', '', this.translate.instant('message.user_profile_experience_remove_success_msg'));
    } catch (err) {

    }
  }

  // delete user experience
  async removeEducation(id: number): Promise<any> {
    try {
      await this.userEducationService.delete(id).toPromise();
      let index = _.findIndex(this.user.educations, {id: id});
      if (index !== -1) this.user.educations.splice(index, 1);
      this.toasterService.pop('success', '', this.translate.instant('message.user_profile_education_remove_success_msg'));
    } catch (err) {

    }
  }

  // delete user experience
  async removeLanguage(id: number, languageId: number): Promise<any> {
    try {
      await this.userLanguageService.delete(languageId).toPromise();
      let index = _.findIndex(this.user.languages, {id: id});
      if (index !== -1) this.user.languages.splice(index, 1);
      this.toasterService.pop('success', '', this.translate.instant('message.user_profile_language_remove_success_msg'));
    } catch (err) {

    }
  }


}
