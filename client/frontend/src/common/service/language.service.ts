import {Injectable} from "@angular/core";
import {HttpService, IMeta} from "../http/http.service";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import * as _ from "lodash";


export interface ILanguage {
  languageId?: string;
  name?: string;
  level?: string;
}



@Injectable()
export class LanguageService {
  constructor(private httpService: HttpService) {
  }


  get(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/languages`, options)
      .map(res => res.json())
  }

  find(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/languages/${id}`, options)
      .map(res => res.json().result)
  }


  store(data: any = {}): Observable<any> {
    return this.httpService
      .post(`public/languages`, data)
      .map(res => res.json().result)
  }



}
