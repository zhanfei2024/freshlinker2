import {Component, AfterViewChecked} from "@angular/core";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './termsConditions.component.html',
})

export class TermsConditionsComponent implements AfterViewChecked{
  public constructor(private seoService: SeoService,
                     private translate: TranslateService) {
  }
  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('about_us.terms_conditions'),this.seoService.getTitleContent());
  }
}
