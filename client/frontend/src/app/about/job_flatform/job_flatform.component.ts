import {Component, AfterViewChecked} from "@angular/core";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './job_flatform.component.html',
})

export class JobFlatFormComponent implements AfterViewChecked{
  public constructor(private seoService: SeoService,
                     private translate: TranslateService) {
  }
  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('about_us.job_flatform'),this.seoService.getTitleContent());
  }

}
