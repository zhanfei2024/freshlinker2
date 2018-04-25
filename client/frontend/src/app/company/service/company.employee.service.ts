import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {EnterpriseHttpService} from "../../../common/http/enterprise.http.service";
import {Auth} from "../../auth/auth.service";
import {IMeta} from "../../post/post.service";

export interface IEmployee {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  selfDescription?: string;
  phone?: string;
  gender?: string;
  yearOfExperience?: string;
  birth?: Date;
  nationalityId?: number;
  expectJobs?: any;
  educations?: any;
  experiences?: any;
  languages?: any;
  skills?: any;
  icon?: any;
}

interface IGetEmployee{
  status: boolean,
  meta?: IMeta,
  result: IEmployee[]
}



@Injectable()
export class CompanyEmployeeService {
  constructor(private auth: Auth,
              private httpService: EnterpriseHttpService) {
  }


  get(id:string,data: any = {}): Observable<IGetEmployee> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`enterprise/companies/${id}/userCompanies`, options)
      .map(res => res.json())
  }


  find(companyId: string, id: string): Observable<any> {
    return this.httpService
      .get(`enterprise/companies/${companyId}/userCompanies/${id}`)
      .map(res => res.json().result)
  }

  destroy(companyId: string, id: string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}/userCompanies/${id}`)
      .map(res => res.json().result)
  }

  update(companyId: string, id: string,data: any ={}): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${companyId}/userCompanies/${id}`,data)
      .map(res => res.json().result)
  }

}
