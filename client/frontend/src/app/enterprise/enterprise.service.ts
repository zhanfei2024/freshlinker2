import {Injectable} from "@angular/core";
import {Auth} from "../auth/auth.service";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {EnterpriseHttpService} from "../../common/http/enterprise.http.service";


export interface IEnterprise {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  balance?: string;
  positionQuota?: number;
  planExpiredDate?: Date;
}

export interface ILanguageLevel {
  id?: number;
  name?: string;
  level?: string;
}

export interface ILanguage {
  id?: string;
  languageId?: string;
  level?: string;
  price?: number;
  name?: string;
  deleted?: boolean
}


@Injectable()
export class EnterpriseService {
  constructor(private auth: Auth,
              private eHttpService: EnterpriseHttpService,) {
  }

  get(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.eHttpService.objectToParams(data)))
    };

    return this.eHttpService
      .get(`enterprise/enterprises`, options)
      .map(res => res.json())
  }

  find(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.eHttpService.objectToParams(data))
    };

    return this.eHttpService
      .get(`enterprise/enterprises/self`, options)
      .map(res => res.json().result)

  }


  update(data: any = {}): Observable<any> {
    return this.eHttpService
      .put(`enterprise/enterprises/self`, data)
      .map(res => res.json().result)
  }

  // activate(data: any = {}): Observable<any> {
  //   return this.eHttpService
  //     .post(`enterprise/activate`, data)
  //     .map(res => res.json().result)
  // }

  setPlan(data: any = {}): Observable<any> {
    return this.eHttpService
      .post(`enterprise/plans`, data)
      .map(res => res.json().result)
  }

  getAccount(data: any = {}): Observable<any> {
    return this.eHttpService
      .get(`enterprise/invoices`, data)
      .map(res => res.json().result)
  }

  getPlan(id: string,data: any = {}): Observable<any> {
    return this.eHttpService
      .post(`enterprise/plans/${id}`, data)
      .map(res => res.json().result)
  }

  getPublicPlan(id: string,data: any = {}): Observable<any> {
    return this.eHttpService
      .post(`public/plans/${id}`, data)
      .map(res => res.json().result)
  }


}
