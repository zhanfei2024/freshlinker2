import {Injectable} from '@angular/core';
import {HttpService} from '../../common/http/http.service';
import {Observable} from 'rxjs';
import {URLSearchParams} from '@angular/http';

export interface IPost {
  id: number,
  title: string,
  content: string,
  updatedBy?: Date,
  createdAt?: Date,
  company?: ICompany;
  companyId?: number;
  categories?: ICategory[];
  tags?: ITag[];
  isApproved: boolean;
  isFeatured: boolean;
  cover?: any;
  user?: IUser;
  userId?: number;
  view: number;
  noUserName?: boolean;
  userName?: string;
  url?: string;
}

export interface IFilter {
  page: number;
  limit: number;
  sorting?: string;
  search?: string;
  tags?: string;
  userId?: number;
  active?: boolean;
  categoryIds?: Array<number>;
}

export interface ICompany {
  id: number;
  address?: string;
  background?: string;
  countryId?: number;
  createdAt?: Date;
  deletedAt?: Date;
  description?: string;
  enterpriseId?: number;
  field?: string;
  foundingTime?: string;
  isApproved: boolean;
  name: string;
  scale?: string;
  stage?: string;
  updatedAt?: Date;
  url?: string;
  view?: number;
}

export interface ICategory {
  id: number;
  name: string;
  parentId?: number;
}

export interface ITag {
  count?: number;
  id: number;
  name: string;
  slug?: string;
}

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ITab {
  id: number;
  name: string;
}

export interface IMeta {
  pagination?: {
    count?: number,
    currentPage?: number,
    nextPage?: number,
    prevPage?: number
    totalCount?: number,
  }
}

interface IGetPost {
  status: boolean,
  meta?: IMeta,
  result: IPost[]
}

interface IGetTag {
  status: boolean,
  meta: IMeta,
  result: ITag[]
}

@Injectable()
export class PostService {
  constructor(private httpService: HttpService) {
  }

  get(data: any = {}): Observable<IGetPost> {
    let options = {
      search: new URLSearchParams(decodeURIComponent(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`public/posts`, options)
      .map(res => res.json())
  }

  find(id: string, data: any = {}): Observable<IGetPost> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/posts/${id}`, options)
      .map(res => res.json().result)
  }

  getClickNum(id: number): Observable<IGetPost> {
    return this.httpService
      .post(`public/posts/${id}/click_traffic`)
      .map(res => res.json().result)
  }


  getTags(data: any = {}): Observable<IGetTag> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/tags`, options)
      .map(res => res.json())
  }

  getComment(commentId: number, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/posts/${commentId}/comments`, options)
      .map(res => res.json())
  }


  getUserName(value: any): string {
    if (value.userId !== null) {
      value.noUserName = value.user.firstName === null ? true : false;
      if (value.noUserName) {
        var user = value.user.email.split('@');
        value.userName = user[0];
      } else {
        value.userName = value.user.firstName + '' + value.user.lastName;
      }
    } else {
      value.userName = value.company.name;
    }
    return value.userName;
  }


  storeComment(postId: number, data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/posts/${postId}/comments`, data)
      .map(res => res.json())
  }

  storeAnswer(postId: number, data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/comments/${postId}/replies`, data)
      .map(res => res.json())
  }

  getLikes(commentId: number, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/comments/${commentId}`, options)
      .map(res => res.json())
  }

  getAnswer(commentId: number, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/comments/${commentId}/replies`, options)
      .map(res => res.json())
  }


  clickLikes(commentId: number, data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/comments/${commentId}/like`, data)
      .map(res => res.json())
  }

  getPublicComments(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/comments`, options)
      .map(res => res.json())
  }

  getArticleCategory(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(decodeURIComponent(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`public/post_categories`, options)
      .map(res => res.json())
  }

  getArticleCategoryTree(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/post_categories/tree`, options)
      .map(res => res.json())
  }

  getArticle(value: IPost, articles: IPost[]) {
    this.getUserName(value);
    articles.push(value);
  }

}
