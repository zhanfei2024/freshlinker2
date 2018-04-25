import {Component, AfterViewChecked} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {SeoService} from "../../../common/global/seo";

@Component({
  templateUrl: './career.component.html',
})

export class CareerComponent implements AfterViewChecked{
  public one: boolean;
  public two: boolean;
  public three: boolean;
  public four: boolean;
   constructor(private seoService: SeoService,
                     private translate: TranslateService) {
  }
  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('about_us.job'),this.seoService.getTitleContent());
  }
}
