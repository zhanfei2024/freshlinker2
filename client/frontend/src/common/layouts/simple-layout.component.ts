import {Component, OnInit}        from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import * as _ from "lodash";

@Component({
  selector: 'app-dashboard',
  templateUrl: './simple-layout.component.html',


})
export class SimpleLayoutComponent implements OnInit {


  constructor(private translate: TranslateService,) {
  }


  ngOnInit(): void {
    if(_.isNull(localStorage.getItem('lang'))){
      this.translate.setDefaultLang('hk');
      this.translate.use('hk');
    }else{
      this.translate.setDefaultLang(localStorage.getItem('lang'));
      this.translate.use(localStorage.getItem('lang'));
    }
  }




}
