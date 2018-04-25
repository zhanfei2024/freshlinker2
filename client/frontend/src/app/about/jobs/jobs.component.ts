import {Component, AfterViewChecked} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {SeoService} from "../../../common/global/seo";

@Component({
    templateUrl: './jobs.component.html',
})

export class JobsComponent implements AfterViewChecked{
  public constructor(private seoService: SeoService,
                     private translate: TranslateService) {
  }
  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('footer.jobs'),this.seoService.getTitleContent());
  }
}
