import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {EnterpriseHttpService} from "../../../common/http/enterprise.http.service";



@Injectable()
export class DashboardService {
  constructor(private httpService: EnterpriseHttpService) {
  }

  findCompanyByUser(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`enterprise/companies`, options)
      .map(res => res.json())
  }

  findCompany(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`enterprise/companies/${id}`, options)
      .map(res => res.json().result)

  }

  findCompanyPositions(id: string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/${id}/positions`, options)
      .map(res => res.json())
  }

  getChart(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`enterprise/companies/${id}/chart`, options)
      .map(res => res.json())
  }

  getCompany(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/self/companies_info`, options)
      .map(res => res.json().result)
  }

  destroy(companyId:string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}`)
      .map(res => res.json().result)
  }

  checkExpired(expiredDate: Date, currentDate: Date): boolean {
    if(currentDate >= expiredDate){
      return true
    }else {
      return false
    }
  }



}
