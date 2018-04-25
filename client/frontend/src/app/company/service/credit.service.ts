import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {EnterpriseHttpService} from "../../../common/http/enterprise.http.service";

export interface ICredit {
  id?: string;
  name?: string;
  last4?: string;
  exp_month?: string;
  exp_year?: string;
  brand?: string;
  country?: string;
  default_source?: boolean;
}



@Injectable()
export class CreditService {
  constructor(private httpService: EnterpriseHttpService,) {
  }


  get(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`enterprise/cards`, options)
      .map(res => res.json())
  }


  find(companyId: string, positionInvitationJobId: string): Observable<any> {
    return this.httpService
      .get(`enterprise/companies/${companyId}/position_invitation_jobs/${positionInvitationJobId}`)
      .map(res => res.json().result)
  }

  recharger(data: any ={}): Observable<any> {
    return this.httpService
      .post(`enterprise/deposit`,data)
      .map(res => res.json().result)
  }

  destroy(id: string): Observable<any> {
    return this.httpService
      .delete(`enterprise/cards/${id}`)
      .map(res => res.json().result)
  }

  setDefaultCredit(id: string,data: any ={}): Observable<any> {
    return this.httpService
      .post(`enterprise/cards/${id}/default`,data)
      .map(res => res.json().result)
  }

  store(data: any): Observable<any> {
    return this.httpService
      .post(`enterprise/cards`,data)
      .map(res => res.json().result)
  }

  buyPlan(data: any ={}): Observable<any> {
    return this.httpService
      .post(`enterprise/plans`,data)
      .map(res => res.json().result)
  }

  buyPlanPosition(data: any ={}): Observable<any> {
    return this.httpService
      .post(`enterprise/positionQuotas`,data)
      .map(res => res.json().result)
  }







}
