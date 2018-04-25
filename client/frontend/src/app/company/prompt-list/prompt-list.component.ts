import {Component, AfterViewChecked} from '@angular/core';
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";


@Component({
  templateUrl: './prompt-list.component.html',
})
export class PromptListComponent implements AfterViewChecked {
  public companyId: string;

  constructor(private seoService: SeoService,
              private translate: TranslateService,) {
    if (localStorage.getItem('company') !== null) this.companyId = localStorage.getItem('company');
  }
  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('enterprise.prompt'), this.seoService.getTitleContent());
  }
}
