import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams, Http} from "@angular/http";
import {HttpService} from "../../../common/http/http.service";

export interface ILanguage {
  languageId?: string;
  id?: string;
  level: string;
}

export interface IUserLanguage {
  id: number;
  languageId: number
  level: string;
  userId?: number;
}

export interface ILanguages {
  id: number;
  name: string;
  UserLanguage: IUserLanguage;
}

export class Language {
  languageId: string;
  id: string;
  level: string;


  constructor(item?: ILanguage) {
    if (item) {
      this.languageId = item.languageId;
      this.id = item.id;
      this.level = item.level;

    }
  }
}

export interface IGetLanguage {
  result: Language[];
}


@Injectable()
export class UserLanguageService {
  constructor(private httpService: HttpService) {

  }

  init(): Observable<any> {
    return this.httpService
      .get(`user/users/self/languages`)
      .map(res => res.json().result)
  }


  get(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/users/self/languages`, options)
      .map(res => res.json())

  }

  find(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`user/users/self/languages/${id}`, options)
      .map(res => res.json().result)
  }

  delete(id: number): Observable<any> {
    return this.httpService
      .delete(`user/users/self/languages/${id}`)
      .map(res => res.json().result)
  }

  store(data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/users/self/languages`, data)
      .map(res => res.json().result)
  }

  update(data: any = {}): Observable<any> {
    return this.httpService
      .put(`user/users/self/languages/${data['id']}`, data)
      .map(res => res.json().result)
  }


}
