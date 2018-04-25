import {Injectable} from "@angular/core";
import {HttpService, IMeta} from "../http/http.service";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import * as _ from "lodash";


export interface ILocation {
  id?: string;
  name?: string;
}

@Injectable()
export class LocationService {
  constructor(private httpService: HttpService) {
  }


  get(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/locations`, options)
      .map(res => res.json())
  }

  find(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/locations/${id}`, options)
      .map(res => res.json().result)
  }

  getLocationTree(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/locations/tree`, options)
      .map(res => res.json())
  }

}
