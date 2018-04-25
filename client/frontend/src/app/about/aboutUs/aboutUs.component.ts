import {Component, OnInit, AfterViewChecked} from "@angular/core";
import {Router} from "@angular/router";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './aboutUs.component.html',
})

export class AboutUsComponent implements AfterViewChecked {

  constructor(private router: Router,
              private seoService: SeoService,
              private translate: TranslateService) {
  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('footer.about_us'),this.seoService.getTitleContent());
  }

  downLoad(url: string) {
    if (localStorage.getItem('id_token') === null) {
      this.router.navigate(['auth/login']);
    } else {
      window.open(url);
    }
  }
}
