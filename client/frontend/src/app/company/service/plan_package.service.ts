import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {EnterpriseHttpService} from "../../../common/http/enterprise.http.service";

export interface IPlan {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  balance?: number;
  positionQuota?: number;
  planExpiredDate?: Date;
}


@Injectable()
export class CompanyPlanPackageService {
  constructor(private httpService: EnterpriseHttpService) {
  }


  setPlan(data: any = {}): Observable<any> {
    return this.httpService
      .post(`enterprise/plans`, data)
      .map(res => res.json())
  }


  getPlan(id: string, data: any = {}): Observable<any> {
    return this.httpService
      .get(`public/plans/${id}`, data)
      .map(res => res.json().result)
  }

  destroy(companyId: string, id: string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}/candidates/${id}`)
      .map(res => res.json().result)
  }

  getPublicPlan( data: any = {}): Observable<any> {
    return this.httpService
      .get(`public/plans`, data)
      .map(res => res.json().result)
  }




}
