import {Component, AfterViewChecked} from "@angular/core";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './mediaReport.component.html',
})

export class MediaReportComponent implements AfterViewChecked {
  public constructor(private seoService: SeoService,
                     private translate: TranslateService) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('footer.our_press_coverage'), this.seoService.getTitleContent());
  }
}
