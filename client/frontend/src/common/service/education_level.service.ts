import {Injectable} from "@angular/core";
import {HttpService, IMeta} from "../http/http.service";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import * as _ from "lodash";

export interface IEducationLevel {
  id?: number;
  name?: string;
  description?: string;
}



@Injectable()
export class EducationLevelService {
  constructor(private httpService: HttpService) {
  }


  get(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/education_levels`, options)
      .map(res => res.json())
  }

  find(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/education_levels/${id}`, options)
      .map(res => res.json().result)
  }




}
