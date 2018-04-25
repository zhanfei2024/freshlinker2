import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams, Http} from "@angular/http";
import {HttpService} from "../../../common/http/http.service";


export interface IExperience {
  id?: string;
  companyName?: string;
  title?: string;
  endedDate?: string;
  description?: string;
  startedDate?: string;
}

export class Experience {
  id: string;
  companyName: string;
  title: string;
  endedDate: string;
  description: string;
  startedDate: string;

  constructor(item?: IExperience) {
    if (item) {
      this.id = item.id;
      this.companyName = item.companyName;
      this.title = item.title;
      this.endedDate = item.endedDate;
      this.description = item.description;
      this.startedDate = item.startedDate;

    }
  }
}

export interface IGetExperience {
  result: Experience[];
}


@Injectable()
export class UserExperienceService {
  constructor(private httpService: HttpService) {

  }

  init(): Observable<any> {
    return this.httpService
      .get(`user/users/experiences`)
      .map(res => res.json().result)
  }


  get(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/users/self/experiences`, options)
      .map(res => res.json())

  }

  find(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`user/users/self/experiences/${id}`, options)
      .map(res => res.json().result)
  }

  delete(id: number): Observable<any> {
    return this.httpService
      .delete(`user/users/self/experiences/${id}`)
      .map(res => res.json().result)
  }

  store(data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/users/self/experiences`, data)
      .map(res => res.json().result)
  }

  update(data: any = {}): Observable<any> {
    return this.httpService
      .put(`user/users/self/experiences/${data['id']}`, data)
      .map(res => res.json().result)
  }


}
