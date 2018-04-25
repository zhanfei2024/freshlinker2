import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {ToasterService} from "angular2-toaster";
import {Router, ActivatedRoute} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {ILanguage, UserLanguageService, Language} from "./profile.language.service";
import * as _ from "lodash";
import {LanguageService} from "../../../common/service/language.service";
import {SeoService} from "../../../common/global/seo";


@Component({
  templateUrl: './profile.language.component.html',

})
export class ProfileLanguageComponent implements OnInit,AfterViewChecked {
  public saveLoading: boolean = false;
  public language: ILanguage;
  public level: number;
  public val: number;
  public list: any[];
  public filter: any = {};
  public userLanguage: any = {};

  constructor(private userLanguageService: UserLanguageService,
              private toasterService: ToasterService,
              private languageService: LanguageService,
              private router: Router,
              private route: ActivatedRoute,
              private seoService: SeoService,
              private translate: TranslateService) {
  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('user.profile.language'),this.seoService.getTitleContent());
  }

  ngOnInit() {
    let footer = document.getElementsByClassName('footer');
    let navbar = document.getElementsByClassName('navbar');
    footer[0]['style'].display='none';
    navbar[0]['style'].display='none';
    this.route.params.subscribe(
      (params)=>{
        if(!_.isUndefined(params['id'])){
          this.userLanguage = this.readFindLanguage(params['id']);
        }else{
          this.userLanguage = new Language();

        }
      }
    );

    this.readLanguage();
    this.list =["Limited","Basic","Good","Professional","Native"];
  }

  async readFindLanguage(id:string): Promise<any> {
    try {
      let data = await this.userLanguageService.find(id).toPromise();
      this.userLanguage = data;
      switch (this.userLanguage.level){
        case "elementary":
          this.val = 0;
          break;
        case "limited_working":
          this.val = 1;
          break;
        case "professional_working":
          this.val = 2;
          break;
        case "full_professional":
          this.val = 3;
          break;
        case "native":
          this.val = 4;
          break;
      }
    } catch (err) {}
  }

  async readLanguage(): Promise<any> {
    try {
      let data = await this.languageService.get({}).toPromise();
      this.language = data.result;
    } catch (err) {}
  }

  changeValue(e) {
    this.level = e.value;
  }

  // save
  async save() {
    this.saveLoading = true;
    switch (this.level) {
      case 0:
        this.userLanguage.level = "elementary";
        break;
      case 1:
        this.userLanguage.level = "limited_working";
        break;
      case 2:
        this.userLanguage.level = "professional_working";
        break;
      case 3:
        this.userLanguage.level = "full_professional";
        break;
      case 4:
        this.userLanguage.level = "native";
        break;
    }

    let funcName = _.isUndefined(this.userLanguage.id) ? 'store' : 'update';
    try {
      this.userLanguage.languageId = _.toNumber(this.userLanguage.languageId);
      let data = await this.userLanguageService[funcName](this.userLanguage).toPromise();
      this.toasterService.pop('success', '', this.translate.instant(data.id === '' ? 'message.user_profile_language_create_success_msg' : 'message.user_profile_language_update_success_msg'));
      this.saveLoading = false;
      this.router.navigate(['/user', 'profile']);
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('message.user_profile_language_update_error_msg'));
      this.saveLoading = false;
    }

  }

}
