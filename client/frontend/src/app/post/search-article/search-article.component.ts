import {Component, OnInit} from "@angular/core";
import {ICategory, IPost, IFilter, IMeta, PostService} from "../post.service";
import {BreadcrumbService} from "../../../common/breadcrumb/breadcrumb.service";
import {ActivatedRoute, Router} from "@angular/router";
import * as _ from "lodash";
import {PositionService} from "../../position/position.service";


@Component({
  templateUrl: './search-article.component.html',
})

export class SearchArticleComponent implements OnInit {
  public category: ICategory[];
  public index: any = {};
  public newArticles: IPost[] = [];
  public categoryIds: any[] = [];
  public hotTags: any[] = [];
  public newLoading: boolean = false;
  public tagLoading: boolean = false;
  public showMore: boolean = false;
  public searchArticles: IPost[] = [];
  public searchArticleLoading: boolean = false;
  public arr: Array<number> = [];
  public meta: IMeta = {pagination: {}};
  public pageNum: IFilter = {
    page: 1,
    limit: 12,
    search: '',
    tags: '',
  };

  public constructor(private breadcrumbService: BreadcrumbService,
                     private postService: PostService,
                     private positionService: PositionService,
                     private router: Router,
                     private route: ActivatedRoute,) {
  }

  ngOnInit() {
    this.breadcrumbService.clear();
    this.breadcrumbService.set({title: 'global.articles', router: '/article-list'});
    this.reloadHotTags();
    this.readCategories();
    this.route.queryParams.subscribe(
      (queryParams) => {
        if(!_.isUndefined(queryParams['search'])){
          this.pageNum.search = queryParams['search'];
          this.pageNum.tags = '';
          this.readArticle();
        } else if (!_.isUndefined(queryParams['tags'])){
          this.pageNum.tags = queryParams['tags'];
          this.pageNum.search = '';
          this.readArticle();
        } else{
          this.pageNum.search ='';
          this.route.params.subscribe(
            (params) =>{
              this.readArticle();
            }
          );

        }
      }
    );

  }

  async reloadNewsPosts(): Promise<any> {
    this.newLoading = true;
    try {
      let data = await this.postService.get({'sorting': 'newest','categoryIds': this.arr, 'limit': 5}).toPromise();
      this.newArticles = data.result;
      this.newLoading = false;
    } catch (err) {
      this.newLoading = false;
    }
  }
  // 加载热门标签
  async reloadHotTags(): Promise<any> {
    this.tagLoading = true;
    try {
      let data = await this.positionService.getTags({type: 'PostTag', limit: 10}).toPromise();
      this.hotTags = data.result;
      this.tagLoading = false;
    } catch (err) {
      this.tagLoading = false;
    }
  }

  // 加载分类
  async readCategories(): Promise<any> {
    let categories = await this.postService.getArticleCategoryTree().toPromise();
    categories.result = _.sortBy(categories.result,['id','id']);
    for (let item of categories.result[0].children) {
      this.arr.push(item.id);
    }
    this.reloadNewsPosts();
    this.arr = [];
  }

  //加载分页
  async changePage(event: any) {
    this.pageNum.page = event.page;
    this.pageNum.limit = event.itemsPerPage;
    await this.readArticle();
  }

  async readArticle(): Promise<any> {
    try {
      this.searchArticleLoading = true;
      let data = await this.postService.get(this.pageNum.search === '' ? _.omit(this.pageNum, 'search') : this.pageNum).toPromise();
      this.meta = data.meta;
      if (data.result.length !== 0) {
        _.each(data.result, (val: any, i: number) => {
          let index = _.findIndex(data.result, {id: val.id});
          if (index === -1) {
            this.postService.getArticle(val, data.result);
          }
          if(val.categories[0].parentId === 1){
            val['path'] = '/articles';
          }else if(val.categories[0].parentId === 7){
            val['path'] = '/activity';
          }else{
            val['path'] = '/interlocution';
          }
        });
        this.searchArticles = data.result;
      } else {
        this.searchArticles = data.result;
      }
      this.searchArticleLoading = false;

    } catch (err) {
      this.searchArticleLoading = false;

    }
  }

  searchArticle(name:string){
    this.router.navigate([`/search-article`], {queryParams: {tags: name}});
  }

}
