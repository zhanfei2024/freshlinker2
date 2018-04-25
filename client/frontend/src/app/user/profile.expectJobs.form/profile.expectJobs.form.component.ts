import {Component, OnInit, AfterViewChecked} from '@angular/core';
import * as _ from "lodash";
import {UserExpectService, Expect} from "./profile.expectJobs.service";

import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import {LocationService, ILocation} from "../../../common/service/location.service";
import {PositionService, IJobNature} from "../../position/position.service";
import {IPositionCategory} from "../../company/service/company-position.service";
import {Router} from "@angular/router";
import {SeoService} from "../../../common/global/seo";


@Component({
  selector: 'profile-expectJobs',
  templateUrl: './profile.expectJobs.form.component.html',
})
export class ProfileExpectJobsFormComponent implements OnInit,AfterViewChecked {
  public locations: ILocation[] = [];
  public saveLoading: boolean = false;
  public positionLocationSelected: any = {};
  public positionLocationChildren: any = [];
  public selectedPositionLocation: any;
  public locationShow: boolean = false;
  public negotiation: boolean = false;
  public positionCategory: IPositionCategory[];
  public positionCategorySelected: any = [];
  public positionCategoryChildren: IPositionCategory[] = [];
  public selectedPositionCategory: IPositionCategory;
  public categoryShow: boolean = false;
  public expect: any = {
    salaryType: ''
  };
  public jobNatures: IJobNature;

  constructor(private userExpectService: UserExpectService,
              private locationService: LocationService,
              private toasterService: ToasterService,
              private router: Router,
              private seoService: SeoService,
              private translate: TranslateService,
              private positionService: PositionService) {

  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('user.profile.expectPosition'),this.seoService.getTitleContent());
  }

  async ngOnInit() {
    let footer = document.getElementsByClassName('footer');
    let navbar = document.getElementsByClassName('navbar');
    footer[0]['style'].display = 'none';
    navbar[0]['style'].display = 'none';
    this.expect = !_.isUndefined(await this.readExpectJob()) ? await this.readExpectJob() : new Expect();
    if (this.expect.id !== "") {
      this.locationShow = true;
      if (!_.isNull(this.expect.locationId)) this.positionLocationSelected = this.expect.location;
      this.categoryShow = true;
      this.positionCategorySelected = this.expect.expectPosition;
    }
    _.toString(this.expect.jobNatureId);
    if (this.expect.minSalary === 0 && this.expect.maxSalary === 0) {
      this.negotiation = true;
      this.expect.minSalary = null;
      this.expect.maxSalary = null;
    }
    this.readExpectJob();
    this.readPositionCategory();
    this.readLocationPromise();
    this.readjobNatures();
  }


  async readExpectJob(): Promise<any> {
    try {
      let data = await this.userExpectService.get({}).toPromise();
      return Promise.resolve(data.result[0]);
    } catch (err) {

    }
  }

  async readjobNatures(): Promise<any> {
    try {
      let data = await this.positionService.getjobNatures({}).toPromise();
      this.jobNatures = data.result;
    } catch (err) {

    }
  }

  async readPositionCategory(): Promise<any> {
    try {
      let data = await this.positionService.getPositionCategory({}).toPromise();
      this.positionCategory = data.result;
      if (!_.isUndefined(this.expect.id)) {
        this.setSelectedPositionCategory(this.positionCategory, null);
      } else {
        this.togglePositionCategory(_.head(this.positionCategory));
      }
    } catch (err) {}
  }

  async readLocationPromise(): Promise<any> {
    try {
      let data = await this.locationService.getLocationTree({}).toPromise();
      this.locations = data.result;
      if (!_.isUndefined(this.expect.id)) {
        this.setSelectedPositionLocation(this.locations, null);
      } else {
        this.togglePositionLocation(_.head(this.locations));
      }
    } catch (err) {}
  }


  // category
  togglePositionCategory(data: any) {
    if (!_.isUndefined(data.children)) {
      _.each(this.positionCategory, (value) => {
        if (_.isEqual(value, data)) {
          data.selected = true;
        } else {
          value['selected'] = false;
        }
      });
      this.positionCategoryChildren = data.children;
    }
  }

  addSelectedPositionCategory(data: IPositionCategory) {
    this.selectedPositionCategory = data;
  }

  setSelectedPositionCategory(children: any, parent: any) {
    _.forEach(children, (child: any) => {
      child.parent = parent;
      if (this.positionCategorySelected.id === child.id) {
        child.selected = true;
        this.selectedPositionCategory = child;
        if (!_.isUndefined(parent) && !_.isNull(parent)) {
          this.togglePositionCategory(child.parent);
        }
      } else {
        child.selected = false;
      }
      if (!_.isUndefined(child.children)) this.setSelectedPositionCategory(child.children, child);
    });
  }


  // location
  togglePositionLocation(data: any) {
    if (!_.isUndefined(data.children)) {
      _.each(this.locations, (value: ILocation) => {
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


  // save
  async save() {
    this.saveLoading = true;
    if (!_.isUndefined(this.selectedPositionCategory)) {
      this.expect.expectPositionId = this.selectedPositionCategory.id;
      this.expect.locationId = this.selectedPositionLocation.id;
      let funcName = _.isUndefined(this.expect.id) ? 'store' : 'update';
      try {
        let data = await this.userExpectService[funcName](this.expect).toPromise();
        this.toasterService.pop('success', '', this.translate.instant(data.id === '' ? 'message.user_profile_expect_create_success_msg' : 'message.user_profile_expect_update_success_msg'));
        this.saveLoading = false;
        this.router.navigate(['/user', 'profile']);
      } catch (err) {
        this.saveLoading = false;
      }
    } else {
      this.toasterService.pop('error', '', this.translate.instant('message.category_input_msg'));
      this.saveLoading = false;
    }
  }

  Checked($event): void {
    if ($event.target.checked) {
      this.expect.minSalary = 0;
      this.expect.maxSalary = 0;
    }
  }

}
