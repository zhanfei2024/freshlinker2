import {Component, OnInit, ViewChild, AfterViewChecked, HostListener} from '@angular/core';
import {ISkill, PositionService} from "../../../position/position.service";
import {IEnterprise, ILanguageLevel, ILanguage, EnterpriseService} from "../../../enterprise/enterprise.service";
import {JobOfferService} from "../../service/company_job_offer.service";
import * as _ from "lodash";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";
import {LanguageService} from "../../../../common/service/language.service";
import {CompanyPositionService, IPosition} from "../../service/company-position.service";
import {EducationLevelService, IEducationLevel} from "../../../../common/service/education_level.service";
import {UserService} from "../../../user/user.service";
import {SelectComponent} from "ng2-select";
import {SeoService} from "../../../../common/global/seo";


@Component({
  templateUrl: './job-offer-form.component.html',
})

export class JobOfferFormComponent implements OnInit,AfterViewChecked {
  public types: any = {};
  public jobOffer: any = {};
  public totalPrice: number = 0;
  public price: any = [];
  public companyId: string;
  public num: number = 0;
  public balance: string;
  public maxCost: number;
  public enterprise: IEnterprise;
  public isNext: boolean = false;
  public skill: Array<any>;

  // education
  public educationPrice: any = [];
  public educationName: string;

  // language
  public language: ILanguage[] = [];
  public languages: ILanguage[] = [];
  public languageLevel: ILanguageLevel[] = [];
  public languageShow: boolean = false;
  public postLanguages: ILanguage[] = [];
  public languagePrice: ILanguage[] = [];
  public educations: IEducationLevel[];


  public positions: IPosition[];

  // skill
  public skills: ISkill[] = [];
  public skillError: boolean = false;
  public experiences: any = [];
  public saveLoading: boolean = false;
  public loading: boolean = false;
  @ViewChild('select') select: SelectComponent;
  @HostListener('window:beforeunload', ['$event'])
  doSomething($event) {
    $event['returnValue']='Your data will be lost!';
  }
  constructor(private enterpriseService: EnterpriseService,
              private positionService: PositionService,
              private educationLevelService: EducationLevelService,
              private companyPositionService: CompanyPositionService,
              private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private translate: TranslateService,
              private toasterService: ToasterService,
              private languageService: LanguageService,
              private seoService: SeoService,
              private jobOfferService: JobOfferService) {

  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('enterprise.position_offer'),this.seoService.getTitleContent());
  }
  ngOnInit() {
    this.jobOffer.companyId = localStorage.getItem('company');
    this.languageLevel = [
      {
        id: 1,
        name: 'Limited',
        level: 'elementary'
      },
      {
        id: 2,
        name: 'Basic',
        level: 'limited_working'
      },
      {
        id: 3,
        name: 'Good',
        level: 'professional_working'
      },
      {
        id: 4,
        name: 'Professional',
        level: 'full_professional'
      }
      ,
      {
        id: 5,
        name: 'Native',
        level: 'native'
      }
    ];

    this.readEnterprise();
    this.loading = true;
    this.route.params.subscribe(
      (params) => {
        if (!_.isUndefined(params['jobId'])) {
          this.readJobOffe(params['jobId']);
        } else {
          this.jobOffer.experience = '0-2';
          //this.language
          if (_.isUndefined(this.jobOffer.maxCost)) {
            this.jobOffer.maxCost = 2000;
            this.maxCost = 2000;
          }
          this.jobOffer.filter = [];
          this.loading = false;
        }
      }
    );
    this.types = {
      education: {
        name: 'user.profile.education',
        selected: false,
        type: 'education',
        gpa: '',
        educationLevelId: ''
      },
      skill: {
        name: 'user.profile.skill',
        selected: false,
        type: 'skill'
      },
      languages: {
        name: 'user.profile.language',
        selected: false,
        type: 'languages'
      },
      experience: {
        name: 'user.profile.experience',
        selected: false,
        type: 'experience'
      }
    };
    this.readPosition();
    this.readEducations();
    this.readLanguages();
    this.tagChanges();
  }
  restGpa(value: number): void {
    if (value >= 5) {
      this.types.education.gpa = 5;
    } else if (value < 0) {
      this.types.education.gpa = 0;
    }
  }
  async readPosition(): Promise<any> {
    try {
      let data = await this.companyPositionService.getEnterprisePositionByCompany(localStorage.getItem('company'), {active: true}).toPromise();
      this.positions = data.result;
    } catch (err) {
    }
  }

  async readEducations(): Promise<any> {
    try {
      let data = await this.educationLevelService.get({}).toPromise();
      this.educations = data.result;
    } catch (err) {
    }
  }

  async readLanguages(): Promise<any> {
    try {
      let data = await this.languageService.get({}).toPromise();
      this.languages = data.result;
    } catch (err) {
    }
  }


  async tagChanges(): Promise<any> {
    try {
      let data = await this.userService.getSkill({}).toPromise();
      this.skill = this.itemsToFomart(data);
    } catch (err) {
    }
  }

  async seachChanges(value): Promise<any> {
    try {
      let data = await this.userService.getSkill({search: value}).toPromise();
      this.select.items = this.itemsToFomart(data);
      this.select.open();
      if (data.length <= 0) {
        let ids = this.skill[this.skill.length - 1].id + 1;
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

  async readEnterprise(): Promise<any> {
    try {
      let data = await this.enterpriseService.find({}).toPromise();
      this.enterprise = data;
      this.balance = data.balance;
    } catch (err) {
    }
  }

/*  public refreshValue(value: any): void {
        this.skills = this.itemsToString(value);
  }*/


  async readJobOffe(id: string): Promise<any> {
    try {
      let data = await this.jobOfferService.find(localStorage.getItem('company'), id).toPromise();
      this.jobOffer = data;
      this.loading = false;

      this.maxCost = parseInt(this.jobOffer.maxCost);
      if (!_.isUndefined(this.jobOffer.filter)) {
        for (let i = 0; i < this.jobOffer.filter.length; i++) {
          let filter = this.jobOffer.filter[i];
          if (_.isUndefined(filter.type)) continue;
          this.types[filter.type].selected = true;
          switch (filter.type) {
            case 'education':
              if (!_.isUndefined(filter.gpa)) this.types[filter.type].gpa = filter.gpa;
              if (!_.isUndefined(filter.educationLevelId)) this.types[filter.type].educationLevelId = filter.educationLevelId;
              break;

            case 'languages':
              _.each(filter.value, (item: ILanguage, index: number)=> {
                this.language.push({id: '', languageId: item.languageId, level: item.level, deleted: false});
                this.getLanguageName(item.languageId, index, this.types['languages']);
              });
              this.languageShow = true;
              break;
            case 'skill':
              this.skills = [];
              _.each(filter.value.split(','), (value)=> {
                this.skills.push({'text': value});
              });
              break;
            case 'experience':
              switch (filter.value[0]) {
                case '0':
                  this.jobOffer.experience = '0-2';
                  break;
                case '3':
                  this.jobOffer.experience = '3-5';
                  break;
              }
              break;
          }

          this.checkPrice();
        }
      } else {
        this.jobOffer.filter = [];
      }
      this.loading = false;
      if (!_.isUndefined(this.jobOffer.positionId)) this.jobOffer.positionName = this.jobOffer.position.name;
    } catch (err) {
    }
  }


  async getPosition(id: string): Promise<any> {
    try {
      let data = await this.positionService.find(id).toPromise();
      this.jobOffer.positionName = data.name;
    } catch (err) {
    }
  }


  // // checkNext
  // checkNext() {
  //   if (_.isUndefined(this.maxCost)) this.maxCost = 2000;
  //   if (parseInt(this.balance) < this.maxCost) {
  //     this.toasterService.pop('error', '', this.translate.instant('message.job_offer_balance_max_cost_error_msg'));
  //   } else {
  //     this.isNext = !this.isNext;
  //   }
  //
  // }

  // checkNext
  checkNext() {
    if (_.isUndefined(this.maxCost)) this.maxCost = 2000;
    if (parseInt(this.balance) < this.maxCost) {
      this.toasterService.pop('error', '', this.translate.instant('message.job_offer_balance_max_cost_error_msg'));
    }
    if (this.jobOffer.filter.length === 0) {
      this.toasterService.pop('error', '', this.translate.instant('message.select_position_post_job_offer'));
    } else {
      if (this.types.skill.selected && _.isUndefined(this.skills)) {
        this.toasterService.pop('error', '', this.translate.instant('message.position_skill_select'));
      } else {
        this.isNext = !this.isNext;
      }

    }
  }


  // checkMaxCost
  checkMaxCost() {
    if (parseInt(this.balance) < this.maxCost) {
      this.toasterService.pop('error', '', this.translate.instant('message.job_offer_balance_max_cost_error_msg'));
    } else {
      this.checkPrice();
    }
  }

  // add question
  addLanguage() {
    this.num = this.num + 1;
    this.languageShow = true;
    this.language.push({id: '', languageId: '', name: '', level: 'elementary', deleted: false});
  }

  deleteLanguage(index: number, value: any) {
    if (this.language[index].id !== "") {
      this.language[index].deleted = true;
    } else {
      this.language.splice(index, 1);
      this.postLanguages.splice(index, 1);
    }
    this.check(value);
  }


  async getLanguageName(id: string, index: number, value: any): Promise<any> {
    try {
      let data = await this.languageService.find(id).toPromise();
      let i = _.findIndex(this.language, {name: data.name});
      if (i === -1) {
        this.language[index].name = data.name;
        this.check(value);
      } else {
        this.toasterService.pop('error', '', this.translate.instant('message.user_profile_language_update_error_msg'));
      }

    } catch (err) {
    }
  }


  check(item: any, event?: any) {
    let i = _.findIndex(this.jobOffer.filter, {'type': item.type});
    if (item.selected) {
      switch (item.name) {
        case 'user.profile.education':
          if (this.types.education.educationLevelId !== "" || this.types.education.gpa !== "") {
            if (i !== -1) {
              if (this.types.education.gpa !== "") {
                this.jobOffer.filter[i] = {
                  type: 'education',
                  educationLevelId: this.types.education.educationLevelId,
                  gpa: this.types.education.gpa,
                  name: 'education'
                };
              } else if (this.types.education.educationLevelId !== '') {
                this.jobOffer.filter[i] = {
                  type: 'education',
                  educationLevelId: this.types.education.educationLevelId,
                  name: 'education'
                };
              }

            } else {
              if (this.types.education.gpa !== "") {
                this.jobOffer.filter.push({
                  type: 'education',
                  educationLevelId: this.types.education.educationLevelId,
                  gpa: this.types.education.gpa,
                  name: 'education'
                });
              } else if (this.types.education.educationLevelId !== '') {
                this.jobOffer.filter.push({
                  type: 'education',
                  educationLevelId: this.types.education.educationLevelId,
                  name: 'education'
                });
              }

            }
          }
          break;

        case 'user.profile.skill':
          if (_.isUndefined(this.skills)) {
            this.skills = [];
          } else {
            this.skills = this.itemsToString(event);
          }
          if (this.skillError) {
            setTimeout(() => {
              this.skillError = false;
            });
          }

          if (this.skills.length > 0) {
            if (this.skills.length > 3) {
              _.each(this.skills, (val, index) => {
                if (index > 2 || _.isUndefined(val)) this.skills.splice(index, 1);
                this.skills = _.cloneDeep(this.skills);
              });
              this.skillError = true;
            } else {
              this.skillError = false;
              if (i !== -1) {
                this.jobOffer.filter[i] = {
                  type: "skill",
                  value: _.map(this.skills, 'text').join(),
                  name: 'skill'
                };
              } else {
                this.jobOffer.filter.push(
                  {
                    type: "skill",
                    value: _.map(this.skills, 'text').join(),
                    name: 'skill'
                  }
                );
              }
            }

          } else {
            if (i !== -1) {
              this.jobOffer.filter.splice(i, 1);
            }
            this.checkSelectedPrice();
          }
          break;
        case 'user.profile.language':
          if (this.language.length > 0) {
            this.postLanguages = [];
            _.each(this.language, (value: any) => {
              if (value.languageId !== '') this.postLanguages.push({
                'name': value.name,
                'languageId': value.languageId,
                'level': value.level
              });
            });
            if (this.postLanguages.length > 0) {
              if (i !== -1) {
                this.jobOffer.filter[i] = {
                  type: "languages",
                  value: this.postLanguages,
                  name: 'language'
                };
              } else {
                this.jobOffer.filter.push(
                  {
                    type: "languages",
                    value: this.postLanguages,
                    name: 'language'
                  }
                );
              }
            }

          }
          break;
        case 'user.profile.experience':
          if (_.isUndefined(this.jobOffer.experience)) this.jobOffer.experience = '0-2';
          switch (this.jobOffer.experience) {
            case '0-2':
              this.experiences = ['0', '0.5', '1', '2'];
              break;
            case '3-5':
              this.experiences = ['3', '4', '5', '5+'];
              break;
          }
          if (i !== -1) {
            this.jobOffer.filter[i] = {
              type: "experience",
              value: this.experiences,
              name: 'experience'
            };
          } else {
            this.jobOffer.filter.push(
              {
                type: "experience",
                value: this.experiences,
                name: 'experience'
              }
            );
          }
          break;
      }
      this.checkSelectedPrice();
    } else {
      let index = _.findIndex(this.jobOffer.filter, {'type': item.type});
      if (index !== -1) {
        this.togglePrice(this.jobOffer.filter[index].type);
        this.jobOffer.filter.splice(index, 1);
      }
      this.checkSelectedPrice();
    }
  }

  checkSelectedPrice() {
    if (this.jobOffer.filter.length === 0) {
      this.totalPrice = 0;
    }
    if (this.types.education.gpa !== '') {
      if (_.isNaN(parseInt(this.types.education.gpa))) {
        this.toasterService.pop('error', '', this.translate.instant('message.job_offer_gpa_input_number_error_msg'));
      } else {
        if (this.types.education.gpa > 5 || this.types.education.gpa < 0) {
          this.toasterService.pop('error', '', this.translate.instant('message.job_offer_gpa_error_msg'));
        } else {
          this.checkPrice();
        }
      }
    } else {
      this.checkPrice();
    }
  }

  checkPrice() {
    if (_.isUndefined(this.maxCost)) this.maxCost = 2000;
    this.readCheckPrice();
  }

  async readCheckPrice(): Promise<any> {
    try {
      let data = await this.jobOfferService.checkPrice({
        positionId: this.jobOffer.positionId,
        companyId: localStorage.getItem('company'),
        maxCost: this.maxCost,
        filter: this.jobOffer.filter
      }).toPromise();
      this.educationPrice = [];
      this.price = [];
      this.totalPrice = this.jobOffer.filter.length > 0 ? data.totalPrice : 0;
      this.jobOffer.maxPersonNum = data.maxPersonNum;
      this.jobOffer.maxPerPrice = data.totalPrice;
      _.each(data.filter, (value: any) => {
        switch (value.type) {
          case 'education':
            if (value.educationLevelId !== null) {
              switch (value.educationLevelId) {
                case 1:
                  this.educationName = 'Master';
                  break;
                case 2:
                  this.educationName = 'Post Graduate';
                  break;
                case 3:
                  this.educationName = 'Degree';
                  break;
                case 4:
                  this.educationName = 'College';
                  break;
                case 5:
                  this.educationName = 'School Certificate';
                  break;
                case 6:
                  this.educationName = 'Any';
                  break;
              }
              this.educationPrice['educationLevel'] = this.educationName;
            }

            if (value.gpa !== undefined && value.gpa !== null) this.educationPrice['gpa'] = value.gpa;
            this.educationPrice['price'] = '8';
            this.educationPrice['totalPrice'] = value.price;
            this.price.push(
              {
                type: value.type,
                name: value.name,
                value: value.value,
                price: value.price
              }
            );
            break;

          case 'skill':
            this.price.push(
              {
                type: value.type,
                name: value.name,
                value: value.value,
                price: value.price
              }
            );
            break;
          case 'languages':
            this.languagePrice = [];
            _.each(value.value, (item: any) => {
              switch (item.level) {
                case 'elementary':
                  item.level = 'Limited';
                  break;
                case 'limited_working':
                  item.level = 'Basic';
                  break;
                case 'professional_working':
                  item.level = 'Good';
                  break;
                case 'full_professional':
                  item.level = 'Professional';
                  break;
                case 'native':
                  item.level = 'Native';
                  break;
              }
              this.languagePrice.push({name: item.name, level: item.level, price: 8});
            });
            this.price.push(
              {
                type: value.type,
                name: value.name,
                value: this.languagePrice,
                price: value.price
              }
            );
            break;
          case 'experience':
            switch (value.value) {
              case '[0,0.5,1,2]':
                this.jobOffer.experience = '0-2';
                break;
              case '[3,4,5,5+]':
                this.jobOffer.experience = '3-5';
                break;
            }
            this.price.push(
              {
                type: value.type,
                name: value.name,
                value: this.jobOffer.experience + this.translate.instant('message.position_experience_year'),
                price: value.price
              }
            );
            break;
        }
      });
      this.loading = false;
    } catch (err) {
      switch (err.code) {
        case 12002:
          this.toasterService.pop('error', '', this.translate.instant('message.job_offer_max_cost_error_msg'));
          break;
        case 12007:
          this.toasterService.pop('error', '', this.translate.instant('message.job_offer_three_skills_error_msg'));
          this.loading = false;

      }
    }
  }


  togglePrice(type: string) {
    switch (type) {
      case 'education':
        this.types.education.educationLevelId = "";
        this.types.education.gpa = "";
        break;
      case 'skill':
        this.skills = [];
        break;
      case 'languages':
        this.language = [];
        break;
    }
  }


  async postOffer() {
    this.saveLoading = true;
    // if (this.jobOffer.filter.length === 0) {
    //   this.toasterService.pop('error', '', this.translate.instant('message.select_position_post_job_offer'));
    // } else {
    //   if (this.types.skill.selected && _.isUndefined(this.skills)) {
    //     this.toasterService.pop('error', '', this.translate.instant('message.position_skill_select'));
    //   } else {
        if (this.maxCost > parseInt(this.balance)) {
          this.toasterService.pop('error', '', this.translate.instant('message.credit_card_balance_no'));
          this.router.navigate(['/company', this.jobOffer.companyId, 'recharge']);
        } else {
          if (_.isUndefined(this.jobOffer.id)) {
            //添加
            this.storeJobOffer();
          } else {
            //更新
            this.updateJobOffer();
          }

    }
    setTimeout(() => {
      this.saveLoading = false;
    });
  }


  async storeJobOffer(): Promise <any> {
    try {
      let data = await this.jobOfferService.store(localStorage.getItem("company"), {
        positionId: this.jobOffer.positionId,
        companyId: localStorage.getItem("company"),
        maxCost: this.maxCost,
        filter: this.jobOffer.filter
      }).toPromise();
      this.toasterService.pop('success', '', this.translate.instant('message.job_offer_send_success_msg'));
      this.router.navigate(['/company', localStorage.getItem("company"), 'job-offer-list']);
    } catch (err) {
      if (err.code === 12000) this.toasterService.pop('error', '', this.translate.instant('message.current_position_have_set_error_msg'));
    }
  }

  async updateJobOffer(): Promise <any> {
    try {
      let data = await this.jobOfferService.update(localStorage.getItem("company"), this.jobOffer.id, {
        positionId: this.jobOffer.positionId,
        companyId: localStorage.getItem("company"),
        maxCost: this.maxCost,
        filter: this.jobOffer.filter
      }).toPromise();
      this.toasterService.pop('success', '', this.translate.instant('message.job_offer_update_success_msg'));
      this.router.navigate(['/company', localStorage.getItem("company"), 'job-offer-list']);
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

  public itemsToString(value: Array<any> = []): any {

    return value
      .map((item: any) => {
        return {text: item.text};
      });

  }

  postPosition() {
    if (this.enterprise['positionQuota'] === 0) {
      this.toasterService.pop('error', '', this.translate.instant('enterprise.postPosition'));
    } else {
      this.router.navigate(['/company', localStorage.getItem('company'), 'positions_create']);
    }
  }


}
