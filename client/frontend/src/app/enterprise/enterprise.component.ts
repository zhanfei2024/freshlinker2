import {Component, AfterViewChecked} from "@angular/core";
import {SeoService} from "../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
    templateUrl: './enterprise.component.html',
})

export class EnterpriseComponent implements AfterViewChecked{
  public constructor(private seoService: SeoService,
                     private translate: TranslateService) {
  }
  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('enterprise.recruitment_platform'),this.seoService.getTitleContent());
  }
}
