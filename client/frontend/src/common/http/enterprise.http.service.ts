import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptionsArgs} from "@angular/http";
import {Config} from "../config/config";
import {Observable} from "rxjs";
import * as _ from "lodash";
import {URLSearchParams} from "@angular/http";

export interface IMeta {
  pagination?: {
    count?: number,
    currentPage?: number,
    nextPage?: number,
    prevPage?: number
    totalCount?: number,
  }
}

export interface IFilter {
  page: number,
  limit: number,
  sorting: string,
  search: '',
  include?: string
}

@Injectable()
export class EnterpriseHttpService {
  constructor(private config: Config,
              private http: Http) {
  }

  createAuthorizationHeader(headers: Headers): Headers {
    if (_.isUndefined(headers)) headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let token = localStorage.getItem('id_token');
    if (token !== null) headers.append('Authorization', `Bearer ${localStorage.getItem('id_token')}`);

    return headers;
  }

  get(url: string, options: RequestOptionsArgs = {search: new URLSearchParams()}): Observable<any> {
    options.headers = this.createAuthorizationHeader(options.headers);
    return this.http
      .get(this.config.apiEndPoint + url, options)
      .catch(this.handleError);
  }

  post(url: string, body: any = {}, options: RequestOptionsArgs = {}): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${localStorage.getItem('id_token')}`);
    return this.http
      .post(this.config.apiEndPoint + url, JSON.stringify(body), {headers: headers})
      .catch(this.handleError);
  }

  put(url: string, body: any = {}, options: RequestOptionsArgs = {}): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${localStorage.getItem('id_token')}`);
    return this.http
      .put(this.config.apiEndPoint + url, JSON.stringify(body), {headers: headers})
      .catch(this.handleError);
  }

  delete(url: string, body: any = {}, options: RequestOptionsArgs = {}): Observable<any> {
    options.headers = this.createAuthorizationHeader(options.headers);
    return this.http
      .delete(this.config.apiEndPoint + url, options)
      .catch(this.handleError);
  }

  handleError(error: any): Observable<any> {
    let errorMsg = error.json() || `Server error`;
    // throw an application level error
    return Observable.throw(errorMsg);
  }

  /**
   * Converts an object to a parametrised string.
   * @param object
   * @returns {string}
   */
  objectToParams(object: any): string {
    return Object.keys(object).map((key) => _.isObject(object[key]) ?
      this.subObjectToParams(encodeURIComponent(key), object[key]) :
      `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`
    ).join('&');
  }

  /**
   * Converts a sub-object to a parametrised string.
   * @param object
   * @returns {string}
   */
  private subObjectToParams(key: string, object: any): string {
    return Object.keys(object).map((childKey) => _.isObject(object[childKey]) ?
      this.subObjectToParams(`${key}[${encodeURIComponent(childKey)}]`, object[childKey]) :
      `${key}[${encodeURIComponent(childKey)}]=${encodeURIComponent(object[childKey])}`
    ).join('&');
  }
}
