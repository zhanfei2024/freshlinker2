import {Component, OnInit, ViewChild, AfterViewChecked,} from '@angular/core';
import {UserExperienceService, Experience} from "./profile.experience.service";
import * as _ from "lodash";
import * as moment from "moment";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {Router, ActivatedRoute} from "@angular/router";
import {SeoService} from "../../../common/global/seo";
import {INgxMyDpOptions, IMyDateModel} from "ngx-mydatepicker";
import {NgxMyDatePickerConfig} from "ngx-mydatepicker/dist/services/ngx-my-date-picker.config";

@Component({
  templateUrl: './profile.experience.form.component.html',
  providers: [NgxMyDatePickerConfig],
})
export class ProfileExperienceFormComponent implements OnInit, AfterViewChecked {
  public saveLoading: boolean = false;
  // public dateOptions: IDate;
  public toDate: boolean = false;
  public selfDescriptionLength: number;
  public experience: any = {
    endedDate: ''
  };
  // 日期控件
  public started: Date;
  public ended: Date;
  public myOptions: INgxMyDpOptions = {
    // other options...
    dateFormat: 'yyyy-mm-dd',
  };


  constructor(private userExperienceService: UserExperienceService,
              private toasterService: ToasterService,
              private router: Router,
              private route: ActivatedRoute,
              private seoService: SeoService,
              private translate: TranslateService) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('user.profile.experience'),this.seoService.getTitleContent());
  }

  onDateChanged(event: IMyDateModel, type: string): void {
  }

  toggleCalendar(): void {
  }
  ngOnInit() {
    let footer = document.getElementsByClassName('footer');
    let navbar = document.getElementsByClassName('navbar');
    footer[0]['style'].display='none';
    navbar[0]['style'].display='none';
    this.route.params.subscribe(
      (params)=>{
        if(!_.isUndefined(params['id'])){
          this.experience = this.readExperience(params['id']);
        }else{
          this.experience = new Experience();
          this.experience.endedDate = '';
          this.experience.startedDate = '';
        }
      }
    );
  }

  async readExperience(id:string): Promise<any> {
    try {
      let data = await this.userExperienceService.find(id).toPromise();
      this.experience = data;
      // change date format
      if (this.experience.startedDate !== null || this.experience.endedDate !== null) {
        let startedDate =_.split(this.experience.startedDate, '-', 3);
        this.experience.startedDate = { date: { year: startedDate[0], month: parseInt(startedDate[1], 10), day: parseInt(startedDate[2], 10) } };
        if (this.experience.endedDate !== 'toDate') {
          let endedDate =_.split(this.experience.endedDate, '-', 3);
          this.experience.endedDate ={ date: { year: endedDate[0], month: parseInt(endedDate[1], 10), day: parseInt(endedDate[2], 10) } };
        } else {
          this.toDate = true;
        }
      }
    } catch (err) {}
  }

  // save
  async save() {
    this.saveLoading = true;
    if ((this.experience.startedDate > this.experience.endedDate && !this.toDate)) {
      this.toasterService.pop('error', '', this.translate.instant('message.date_add_error_msg'));
      setTimeout(() => {
        this.saveLoading = false;
      }, 1000);
    } else {
      if (this.toDate) this.experience.endedDate = 'toDate';
      let funcName = _.isUndefined(this.experience.id) ? 'store' : 'update';
      this.experience.startedDate = moment(this.experience.startedDate['jsdate']).format('YYYY-MM-DD');
      this.experience.endedDate = moment(this.experience.endedDate['jsdate']).format('YYYY-MM-DD');
      try {
        let data = await this.userExperienceService[funcName](this.experience).toPromise();
        data.startedDate = moment(data.startedDate).format('YYYY-MM-DD');
        if (data.endedDate !== 'toDate') data.endedDate = moment(data.endedDate).format('YYYY-MM-DD');
        this.toasterService.pop('success', '', this.translate.instant(data.id === '' ? 'message.user_profile_experience_create_success_msg' : 'message.user_profile_experience_update_success_msg'));
        this.saveLoading = false;
        this.router.navigate(['/user','profile']);
      } catch (err) {
        this.toasterService.pop('warning', 'Warning', err);
        this.saveLoading = false;

      }
    }

  }


}
