import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {EnterpriseHttpService} from "../../../common/http/enterprise.http.service";

export interface IAwards {
  name: string;
  date: string;
}

@Injectable()
export class WelfareAwardsService {
  constructor(private httpService: EnterpriseHttpService,) {
  }


  getWelfare(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`enterprise/companies/${id}/companyWelfares`, options)
      .map(res => res.json())
  }


  findWelfare(companyId: string, id: string): Observable<any> {
    return this.httpService
      .get(`enterprise/companies/${companyId}/companyWelfares/${id}`)
      .map(res => res.json().result)
  }


  destroyWelfare(id: string, welfareId: string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${id}/companyWelfares/${welfareId}`)
      .map(res => res.json().result)
  }


  storeWelfare(id: string, data: any = {}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies/${id}/companyWelfares`, data)
      .map(res => res.json().result)
  }

  getPublicWelfare(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`public/companies/${id}/companyWelfares`, options)
      .map(res => res.json())
  }

  findPublicWelfare(id: string): Observable<any> {
    return this.httpService
      .get(`public/companyWelfares/${id}`)
      .map(res => res.json().result)
  }

  getAwards(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`enterprise/companies/${id}/companyAwards`, options)
      .map(res => res.json())
  }


  getPublicAwards(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`public/companies/${id}/companyAwards`, options)
      .map(res => res.json())
  }

  findPublicAwards(id: string): Observable<any> {
    return this.httpService
      .get(`public/companyAwards/${id}`)
      .map(res => res.json().result)
  }


  findAwards(companyId: string, id: string): Observable<any> {
    return this.httpService
      .get(`enterprise/companies/${companyId}/companyAwards/${id}`)
      .map(res => res.json().result)
  }


  destroyAwards(id: string, welfareId: string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${id}/companyAwards/${welfareId}`)
      .map(res => res.json().result)
  }


  storeAwards(id: string, data: any = {}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies/${id}/companyAwards`, data)
      .map(res => res.json().result)
  }


}
