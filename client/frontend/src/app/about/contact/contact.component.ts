import {Component, AfterViewChecked} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {SeoService} from "../../../common/global/seo";

@Component({
  templateUrl: './contact.component.html',
})

export class ContactComponent implements AfterViewChecked{
  public constructor(
                     private seoService: SeoService,
                     private translate: TranslateService) {
  }
  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('about_us.contact_us'),this.seoService.getTitleContent());
  }
}
