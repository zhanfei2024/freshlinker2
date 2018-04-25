import {Injectable} from '@angular/core';
import {HttpService} from '../../common/http/http.service';
import {Auth} from '../auth/auth.service';
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
  address?: string;
  description?: string;
  icon?: any;
  foundingTime?: number;
  pictures?: any;
  cover?: any;
  positions?: any;
}


@Injectable()
export class UpgradeCompanyService {
  constructor(private auth: Auth,
              private httpService: HttpService,) {
  }

  getCompanyPosition(companyId: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`public/companies/${companyId}/positions`, options)
      .map(res => res.json())
  }


  find(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`enterprise/companies/${id}/positions${data['id']}`, options)
      .map(res => res.json().result)

  }


  getCompanyDynamic(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/companies/${id}/companyDynamics`, options)
      .map(res => res.json())
  }
  deletedCompanyDynamic(companyId: string, id: string, data: any = {}): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}/companyDynamics/${id}`, data)
      .map(res => res.json().result)
  }

  getFindCompanyDynamic(companyId: string, id: string, data: any = {}): Observable<any> {
    return this.httpService
      .get(`public/companies/${companyId}/companyDynamics/${id}`, data)
      .map(res => res.json().result)
  }

  getReviews(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/reviews`, options)
      .map(res => res.json())
  }

  postReviews(data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/reviews`, data)
      .map(res => res.json().result)
  }


}
