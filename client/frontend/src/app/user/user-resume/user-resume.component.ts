import {Component, OnInit, AfterViewChecked} from "@angular/core";
import {IUser, UserService} from "../user.service";
import * as moment from "moment";
import {ISkill} from "../../position/position.service";
import * as _ from "lodash";
import {ActivatedRoute} from "@angular/router";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";
import {Location} from "@angular/common";

@Component({
  templateUrl: './user-resume.component.html'
})

export class UserResumeComponent implements OnInit,AfterViewChecked {
  public user: IUser;
  public loading: boolean = false;
  public isCompany: boolean = false;
  public gender: boolean;
  public name: string;
  public companyId: string;
  public skills: ISkill[] = [];
  public defaultSkills: ISkill[] = [];

  public constructor(private userService: UserService,
                     private seoService: SeoService,
                     private translate: TranslateService,
                     private location: Location,
                     private route: ActivatedRoute) {
  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('user.profile.resume_preview'), this.seoService.getTitleContent());
  }
  ngOnInit() {
    this.route.params.subscribe(
      (parmas) => {
        if (!_.isUndefined(parmas['id'])) {
          this.readFindUser(parmas['id']);
          this.isCompany = true;
          this.companyId = localStorage.getItem('company');

        } else {
          this.readUser();
          this.isCompany = false;
        }
      });
  }
  goBack(): void {
    this.location.back();
  }
  async readFindUser(id: string): Promise<any> {
    try {
      this.loading = true;
      let data = await this.userService.findUser(id).toPromise();
      this.user = data;
      if (this.user.experiences.length > 0) {
        _.each(this.user.experiences, (val:any) => {
          val.startedDate = moment(val.startedDate).toDate();
          if (val.endedDate !== 'toDate') {
            val.endedDate = moment(val.endedDate).toDate();
          }
        });
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

      this.readSkillChange('skill');
      this.loading = false;
    } catch (err) {
      this.loading = false;
    }
  }

  async readUser(): Promise<any> {
    try {
      this.loading = true;
      let data = await this.userService.find({}).toPromise();
      this.user = data;
      if (this.user.experiences.length > 0) {
        _.each(this.user.experiences, (val:any) => {
          val.startedDate = moment(val.startedDate).toDate();
          if (val.endedDate !== 'toDate') {
            val.endedDate = moment(val.endedDate).toDate();
          }
        });
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

      this.readSkillChange('skill');
      this.loading = false;
    } catch (err) {
      this.loading = false;
    }
  }

  async readSkillChange(type: string): Promise<any> {
    let tag: ISkill[] = [];
    try {
      let data = await this.userService.getSkill({'type': type}).toPromise();
      if (this.user.skills.length > 0) {
        _.each(this.user.skills, (value:any) => {
          tag.push({name: value.name});
        });
        this.user.skills = tag;
        this.skills = tag;
      }
      _.each(data.result, (value: any) => {
        this.defaultSkills.push({name: value.name});
      });
    } catch (err) {

    }
  }

}
