import {Injectable} from '@angular/core';
import {HttpService} from '../../common/http/http.service';
import {Observable} from 'rxjs';
import {URLSearchParams} from '@angular/http';

export interface ICompany {
  id?: string;
  countryId?: number;
  userId?: number;
  name?: string;
  url?: string;
  scale?: string;
  field?: string;
  stage?: string;
  view?: number;
  background?: string;
  isApproved?: boolean;
  isVIP?: boolean;
  address?: string;
  description?: string;
  icon?: any;
  foundingTime?: number;
  pictures?: any;
  cover?: any;
  positions?: any;
  length?: any[]
}


@Injectable()
export class HotCompanyService {
  constructor(private httpService: HttpService) {
  }

  get(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`public/companies`, options)
      .map(res => res.json())
  }

  find(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/companies/${id}`, options)
      .map(res => res.json().result)

  }


  store(id: string, data: any = {}): Observable<any> {
    return this.httpService
      .post(`public/companies/${id}/click_traffic`, data)
      .map(res => res.json().result)
  }


}
