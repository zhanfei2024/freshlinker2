import {Component, OnInit} from '@angular/core';
import {UserPostService} from "../user_article/user_article.service";
import {ActivatedRoute} from "@angular/router";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './user.post.preview.component.html',
})

export class UserArticlePreviewComponent implements OnInit {
  public article: any = {};
  public loading: boolean = false;
  public returnUrl: any = [];
  public editUrl: any = [];

  constructor(private userPostService: UserPostService,
              private translate: TranslateService,
              private seoService: SeoService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe(
      (params) => {
        this.reloadPost(params['id']);
        switch (this.activatedRoute.url['value'][0].path) {
          case 'article':
            this.returnUrl = ['/user', 'article'];
            this.editUrl = ['/user', 'article', params['id'],'edit'];
            this.seoService.setTitle(this.translate.instant('enterprise.article_preview'),this.seoService.getTitleContent());
            break;
          case 'activity':
            this.returnUrl = ['/user', 'activity'];
            this.editUrl = ['/user', 'activity', params['id'],'edit'];
            this.seoService.setTitle(this.translate.instant('enterprise.activity_preview'),this.seoService.getTitleContent());
            break;
          case 'qa':
            this.returnUrl = ['/user', 'qa'];
            this.editUrl = ['/user', 'qa', params['id'],'edit'];
            this.seoService.setTitle(this.translate.instant('enterprise.QA_preview'),this.seoService.getTitleContent());

            break;

        }
      }
    );
  }

  async reloadPost(id: string): Promise<any> {
    this.loading = true;
    try {
      let data = await this.userPostService.find(id).toPromise();
      this.article = data;
      this.loading = false;
    } catch (err) {
      this.loading = false;
    }
  }

}
