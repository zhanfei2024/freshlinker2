import {Component, AfterViewChecked} from "@angular/core";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './industry_feed.component.html',
})

export class IndustryFeedComponent implements AfterViewChecked{
  public constructor(private seoService: SeoService,
                     private translate: TranslateService) {
  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('footer.industry_feed'),this.seoService.getTitleContent());
  }
}
