import {Component, OnInit, AfterViewChecked } from "@angular/core";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";
import {CompanyService} from "../service/company.service";
import {ChatService} from "../../../common/chat/chat.service";

@Component({
  templateUrl: './company-news-center.component.html',
})

export class COmpanyNewsCenterComponent implements OnInit, AfterViewChecked {
  textareaShow = false;
  articleShow = false;
  replyAnswerText= '';
  isRead = false;
  news: any;
  public companyId:string;
 constructor(private companyService: CompanyService,
             private chatSevice: ChatService,
             private translate: TranslateService,
             private seoService: SeoService) { }

  ngOnInit(): void {
    this.getComents();
    this.companyId = localStorage.getItem('company');
    localStorage.removeItem('activatedPositionId');
    localStorage.removeItem('activatedId');
  }
  ngAfterViewChecked() {
    this.seoService.setTitle( this.translate.instant('user.news.new_message'), this.seoService.getTitleContent());
  }
  /*获取评论*/
  async getComents(): Promise<any> {
    const data = await this.companyService.getReviews(localStorage.getItem('company')).toPromise();
    this.news = data.result;
    localStorage.setItem('isCompanyRead', 'false');
    this.chatSevice.isRead(false);
  }

  /*点击查看详情时，设置store状态*/
  commentState(positionId: number, str: string): void {
    switch (str) {
      case 'company-list':
        localStorage.setItem('commentState', '4');
        break;
      case 'profile':
        localStorage.setItem('commentState', '4');
        break;
      case 'interview':
        localStorage.setItem('commentState', positionId.toString());
        break;
    }

  }

}
