import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {EnterpriseHttpService} from "../../common/http/enterprise.http.service";


@Injectable()
export class PositionQuestionService {
  constructor(private httpService: EnterpriseHttpService) {
  }

  get(companyId: string, positionId: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/${companyId}/positions/${positionId}/questions`, options)
      .map(res => res.json())
  }

  update(companyId: string, positionId: string, questionId: string, data: any = {}): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${companyId}/positions${positionId}/questions/${questionId}`, data)
      .map(res => res.json().result)
  }

  store(companyId: string, positionId: string, data: any = {}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies/${companyId}/positions/${positionId}/questions`, data)
      .map(res => res.json().result)
  }

  delete(companyId: string , positionId: string, psoitionQuestionId: string): Observable<any> {
     return this.httpService
         .delete(`enterprise/companies/${companyId}/positions/${positionId}/questions/${psoitionQuestionId}`)
         .map(res => res.json().result)
  }



}
