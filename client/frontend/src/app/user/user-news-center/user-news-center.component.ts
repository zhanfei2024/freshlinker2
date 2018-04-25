import {Component, OnInit, AfterViewChecked } from "@angular/core";
import {UserService} from "../user.service";
import {ActivatedRoute} from "@angular/router";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";
import {ChatService} from "../../../common/chat/chat.service";

@Component({
  templateUrl: './user-news-center.component.html',
})

export class UserNewsCenterComponent implements OnInit ,AfterViewChecked{
  textareaShow = false;
  articleShow = false;
  replyAnswerText= '';
  myCommentShow = false;
  formShow = false;
  currentDay = Date.now();
  isRead = false;
  news: any;
  newsNum: number;
 constructor(private userService: UserService,
             private route: ActivatedRoute,
             private chatSevice: ChatService,
             private translate: TranslateService,
             private seoService: SeoService) { }

  ngOnInit(): void {
    if (location.pathname === '/user/user-news') {
          this.getComents();
    }else {
      this.route.params.subscribe((params) => {
          this.getFindComents(params['id']);
      });
    }
  }
  ngAfterViewChecked(): void {
    this.seoService.setTitle(this.translate.instant('user.news.new_message'), this.seoService.getTitleContent());
  }

  reply(value): any{
     value.textareaShow = !value.textareaShow;
  }

  articleToggle(): void {
     this.articleShow = !this.articleShow;
     this.myCommentShow = true;
  }

  update(value: any, comment): void {
     comment.textareaShow = false;
     this.myCommentShow = true;
  }

  /*获取评论*/
  async getComents(): Promise<any> {
    const data = await this.userService.getComment().toPromise();
    this.news = this.userService.itemsFilter(data.result);
    this.newsNum = this.news.length;
    localStorage.setItem('isRead','false');
    this.chatSevice.isRead(false);
  }

  async getFindComents(id: string): Promise<any> {
    const data = await this.userService.getFindComment(id).toPromise();
    this.news = this.userService.itemsFilter(data.result);
    this.newsNum = this.news.length;
  }

  /*上传评论*/
/*  async postAnwer(id: number, postId: number): Promise<any> {
    if(this.userService.isAuthenticated()){
      try {
        let data = await this.userService.storeAnswer(id, {content: this.replyAnswerText, postId: postId}).toPromise();
        this.news.replies.push(data.result);
        this.toasterService.pop('success', '', this.translate.instant('article.editorial_success_msg'));
        this.replyAnswerText = "";
      } catch (err) {}
    }else{
      localStorage.setItem('loginRequest', 'back');
      this.router.navigate(['/auth/login']);
    }
  }*/

}
