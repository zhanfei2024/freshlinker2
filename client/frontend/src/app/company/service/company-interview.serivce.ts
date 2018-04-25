import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {EnterpriseHttpService} from "../../../common/http/enterprise.http.service";
import {Auth} from "../../auth/auth.service";

export interface ICandidate {
  id?: string;
  candidateStatusId?: number;
  positionId?: number;
  enterpriseId?: number;
  positionName?: string;
  positionPostedDate?: Date;
  isBlacklist?: boolean;
  isRead?: boolean;
  noUserName?: boolean;
  userName?: string;
  user?: IUser;
  company?: ICompany;
  userId?: string;
  companyId?: string;
}

export interface IUser {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ICompany {
  id?: number;
  name?: string;
}


@Injectable()
export class CandidatePositionService {
  constructor(private auth: Auth,
              private httpService: EnterpriseHttpService,) {
  }


  get(id:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`enterprise/companies/${id}/candidates`, options)
      .map(res => res.json())
  }


  find(companyId: string, id: string): Observable<any> {
    return this.httpService
      .get(`enterprise/companies/${companyId}/candidates/${id}`)
      .map(res => res.json().result)
  }

  destroy(companyId: string, id: string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}/candidates/${id}`)
      .map(res => res.json().result)
  }

  update(companyId: string, id: string,data: any ={}): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${companyId}/candidates/${id}`,data)
      .map(res => res.json().result)
  }


  store(companyId: string,data: any ={}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies/${companyId}/candidates`,data)
      .map(res => res.json().result)
  }

  getUserName(value: ICandidate): string {
    if(value.userId !== null) {
      value.noUserName = value.user.firstName === null ? true : false;
      if(value.noUserName) {
        var user = value.user.email.split('@');
        value.userName = user[0];
      } else {
        value.userName = value.user.firstName + '' + value.user.lastName;
      }
    } else {
      value.userName = value.company.name;
    }
    return value.userName;
  }







}
