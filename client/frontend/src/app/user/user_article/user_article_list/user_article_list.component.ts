import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {IPost, UserPostService} from "../user_article.service";
import {IFilter, IMeta} from "../../../post/post.service";
import * as _ from "lodash";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";
import {SeoService} from "../../../../common/global/seo";
import {number} from "ng2-validation/dist/number";


@Component({
  templateUrl: './user_article_list.component.html',
})
export class UserArticleComponent implements OnInit,AfterViewChecked {
  public companyId: string;
  public articles: IPost[] = [];
  public tableLoading: boolean = false;
  public articleStatus: any[] = [];
  public categoryIds: any[] = [];
  public articleIndex: number = 1;
  public changeTabLoading: boolean = false;
  public articleLoading: boolean = false;
  public meta: IMeta = {pagination: {}};
  public prveFilter = {
    page: number,
    itemsPerPage: number
  };
  public filter: IFilter = {
    limit: 10,
    page: 1,
    active: null,
    categoryIds: [],
    search: ''
  };

  constructor(private userPostService: UserPostService,
              private toasterService: ToasterService,
              private seoService: SeoService,
              private translate: TranslateService,) {
  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('enterprise.article_list'),this.seoService.getTitleContent());
  }
  ngOnInit() {
    this.articleStatus = [
      {
        id: 1,
        name: 'enterprise.article_published'
      },
      {
        id: 2,
        name: 'enterprise.offline_article'
      }
    ];
    this.articleTab(1);
  }

  articleTab(id: number) {
    this.articleIndex = id;
    this.changeTabLoading = true;
    this.articleLoading = true;
    this.articles = [];
    this.filter.search = '';
    switch (id) {
      case 1:
        this.filter.active = true;
        break;
      case 2:
        this.filter.active = false;
        break;
    }
    this.readCategory();
    this.changeTabLoading = false;
  }

  searchArticle() {
    this.changeTabLoading = true;
    this.articleLoading = true;
    this.articles = [];
    this.changeTabLoading = false;
    this.readPostCallServer();
  }

  //加载分页
  async changePage(event: any) {
    this.articleLoading = true;
    this.filter.page = event.page;
    this.filter.limit = event.itemsPerPage;
    await this.readPostCallServer();
  }

  async readCategory(): Promise<any> {
    try {
      this.categoryIds = [];
      let categories = await this.userPostService.getArticleCategoryTree({}).toPromise();
      categories.result = _.sortBy(categories.result,['id','id']);
      for (let item of categories.result[0].children) {
        this.categoryIds.push(item.id);
      }
      this.filter.categoryIds = this.categoryIds;
      this.readPostCallServer();
    } catch (err) {

    }
  }

  async readPostCallServer(): Promise<any> {
    try {
      this.tableLoading = true;
      this.articleLoading = true;
      let data = await this.userPostService.get(this.filter.search === '' ? _.omit(this.filter, 'search') : this.filter).toPromise();
      this.meta = data.meta;
      this.articles = data.result.sort(this.compare('updatedAt'));
      this.tableLoading = false;
      this.articleLoading = false;
    } catch (err) {
      this.tableLoading = false;
      this.articleLoading = false;

    }
  }
  /*根据数组中的对象某一个属性值进行排序*/
  compare(property): any {
    return function (a, b) {
      const value1 = parseInt(a[property].replace(/-|T|:/g, ''), 10);
      const value2 = parseInt(b[property].replace(/-|T|:/g, ''), 10);
      return value2 - value1;
    }
  }
  // 删除文章
  async destory(id: string) {
    try {
      this.articleLoading = true;
      await this.userPostService.delete(id).toPromise();
      let index = _.findIndex(this.articles, {id: id});
      if (index !== -1) {
        this.articles.splice(index, 1);
        if (this.articles.length === 0 && this.filter.page - 1 > 0) {
          this.filter.page -= 1;
        }
      }
      this.articleLoading = false;
    } catch (err) {
      this.articleLoading = false;
    }
  }

  async editArticle(id: string, type: string) {
    try {
      this.articleLoading = true;
      let active: boolean;
      active = type === 'offline' ? false : true;
      await this.userPostService.editArticle(id, {'active': active}).toPromise();
      switch (type) {
        case 'offline':
          this.articleTab(1);
          break;
        case 're-publish':
          this.articleTab(2);
          break;
      }
      this.articleLoading = false;
      this.toasterService.pop('success', '', this.translate.instant('message.resume_success_msg'));
    } catch (err) {
      this.articleLoading = false;
    }
  }


}
