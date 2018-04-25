import {Injectable} from "@angular/core";
import {TranslateService} from '@ngx-translate/core';
import * as _ from "lodash";

@Injectable()
export class I18nService {
    constructor(public translate: TranslateService) {
      if(_.isNull(localStorage.getItem('lang'))){
        translate.setDefaultLang('hk');
        translate.use('hk');
      }else{
        translate.setDefaultLang(localStorage.getItem('lang'));
        translate.use(localStorage.getItem('lang'));
      }
    }

    setLanguage(lang: string = '') {
        if (_.indexOf(['en', 'hk', 'cn'], lang) !== -1) {
            this.translate.use(lang);
        } else {
            this.translate.use('en');
        }
    }
  instant(string) {
    return this.translate.instant(string);
  }
}
