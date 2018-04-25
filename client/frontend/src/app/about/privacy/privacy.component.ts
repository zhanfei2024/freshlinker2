import {Component, AfterViewChecked} from "@angular/core";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './privacy.component.html',
})

export class PrivacyComponent implements AfterViewChecked{
  public constructor(private seoService: SeoService,
                     private translate: TranslateService) {
  }
  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('about_us.privacy'),this.seoService.getTitleContent());
  }
}
