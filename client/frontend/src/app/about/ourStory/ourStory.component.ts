import {Component, AfterViewChecked} from "@angular/core";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './ourStory.component.html',
})

export class OurStoryComponent implements AfterViewChecked {
  public myInterval: number = 5000;
  public noWrapSlides: boolean = false;
  public slides: any[] = [];

  public constructor(private seoService: SeoService,
                     private translate: TranslateService) {
    this.myInterval = 5000;
    this.noWrapSlides = false;
    for (let i = 1; i < 9; i++) {
      this.addSlide(i);
    }

  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('footer.our_press_coverage'), this.seoService.getTitleContent());
  }

  public addSlide(index: number): void {
    let newWidth = '../../assets/img/our_story_img_' + index + '.png';
    this.slides.push({
      image: `${newWidth}`
    });
  }


}
