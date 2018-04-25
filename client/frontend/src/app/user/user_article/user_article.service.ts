import {Injectable} from "@angular/core";
import {IMeta, HttpService} from "../../../common/http/http.service";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";


export interface IPost {
  id?: number,
  adminId: number,
  companyId: string,
  categoryIds: Array<number>,
  categories: any,
  pictures: any,
  title: string,
  slug?: string,
  flag: string;
  code:string;
  isFeatured?: boolean,
  cover?: any,
  active: boolean,
  tags: ISkill[],
  content: string,
  isApproved: boolean,
  createdAt?: string,
  url?: string,
  updatedAt?: string,
}

export class Post {
  id: number;
  adminId: number;
  companyId: string;
  categoryIds: Array<number>;
  categories: any;
  flag: string;
  code:string;
  cover: any;
  pictures: any;
  title: string;
  slug: string;
  content: string;
  isFeatured: boolean;
  active: boolean;
  tags: ISkill[];
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  checked: boolean = false;
  result?:any;
  url?: string;


  constructor(item?: IPost) {
    if (item) {
      this.id = item.id;
      this.adminId = item.adminId;
      this.code = item.code;
      this.flag = item.flag;
      this.categoryIds = item.categoryIds;
      this.categories = item.categories;
      this.pictures = item.pictures;
      this.title = item.title;
      this.slug = item.slug;
      this.cover = item.cover;
      this.content = item.content;
      this.url = item.url;
      this.isFeatured = item.isFeatured;
      this.active = item.active;
      this.tags = item.tags;
      this.isApproved = item.isApproved;
      this.createdAt = item.createdAt;
      this.updatedAt = item.updatedAt;
    }
  }
}
export interface ISkill {
  id?: string;
  name?: string;
}

export interface IArticleCategory {
  id?: string;
  name?: string;
  parentId?: string;

}

export interface IGetPost {
  status: boolean,
  meta: IMeta,
  result: Post[]
}


//for file tab
export interface IFile {
  createdAt?: string,
  createdBy?: string,
  postId?: number,
  extension?: string,
  id?: string,
  key?: string,
  mime?: string,
  name?: string,
  path?: string,
  size?: string,
  updatedAt?: string,
  updatedBy?: string,
  url?: string
}

export class File {
  createdAt: string;
  createdBy: string;
  postId: number;
  extension: string;
  id: string;
  key: string;
  mime: string;
  name: string;
  path: string;
  size: string;
  updatedAt: string;
  updatedBy: string;
  url: string;

  constructor(item?: IFile) {
    if (item) {
      this.createdAt = item.createdAt;
      this.createdBy = item.createdBy;
      this.postId = item.postId;
      this.extension = item.extension;
      this.id = item.id;
      this.key = item.key;
      this.mime = item.mime;
      this.name = item.name;
      this.path = item.path;
      this.size = item.size;
      this.updatedAt = item.updatedAt;
      this.updatedBy = item.updatedBy;
      this.url = item.url;
    }
  }
}

export interface IGetFile {
  status: boolean,
  meta: IMeta,
  result: File[]
}


@Injectable()
export class UserPostService {

  constructor(private httpService: HttpService) {
  }

  // get list.
  get(data: any = {}): Observable<IGetPost> {
    let options = {
      search: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService.get(`user/posts`, options)
      .map(res => res.json())
      .map(res => {
        res.result = res.result.map((item) => new Post(item));
        return res;
      })
  }


  find(id: string, data: any = {}): Observable<Post> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService.get(`user/posts/${id}`, options)
      .map(res => res.json().result)
      .map(res => new Post(res));
  }

  update(data: any = {}): Observable<Post> {
    return this.httpService.put(`user/posts/${data['id']}`, data)
      .map(res => res.json().result)
      .map(res => new Post(res));
  }

  store(data: any): Observable<Post> {
    return this.httpService.post(`user/posts`, data)
      .map(res => res.json().result)
      .map(res => new Post(res))
  }

  delete(id: string): Observable<boolean> {
    return this.httpService
      .delete(`user/posts/${id}`)
      .map(res => res.json().result);
  }

  getArticleCategoryTree(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/post_categories/tree`, options)
      .map(res => res.json())
  }

  editArticle(id: string,data: any = {}): Observable<any> {
    return this.httpService
      .put(`user/posts/${id}/modify_active`,data)
      .map(res => res.json().result);
  }

}
