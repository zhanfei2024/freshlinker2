import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {EnterpriseHttpService} from "../../../common/http/enterprise.http.service";
import {Auth} from "../../auth/auth.service";
import {IMeta} from "../../position/position.service";

export interface IJobOffer {
  id?: string;
  positionId: string;
  companyId: string;
  filter: any;
  active: boolean;
  total? :number;
  name?: string;
  position?: any;
}

interface IGetJobOffer{
  status: boolean,
  meta?: IMeta,
  result: IJobOffer[]
}



@Injectable()
export class JobOfferService {
  constructor(private httpService: EnterpriseHttpService,) {
  }


  get(id:string,data: any = {}): Observable<IGetJobOffer> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`enterprise/companies/${id}/position_invitation_jobs`, options)
      .map(res => res.json())
  }

  getInviteNum(companyId: string, positionInvitationJobId: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`enterprise/companies/${companyId}/position_invitation_jobs/${positionInvitationJobId}/persons`, options)
      .map(res => res.json())
  }


  find(companyId: string, positionInvitationJobId: string): Observable<any> {
    return this.httpService
      .get(`enterprise/companies/${companyId}/position_invitation_jobs/${positionInvitationJobId}`)
      .map(res => res.json().result)
  }

  destroy(companyId: string, id: string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}/position_invitation_jobs/${id}`)
      .map(res => res.json().result)
  }

  update(companyId: string, id: string,data: any ={}): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${companyId}/position_invitation_jobs/${id}`,data)
      .map(res => res.json().result)
  }

  store(companyId: string,data: any ={}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies/${companyId}/position_invitation_jobs`,data)
      .map(res => res.json().result)
  }

  checkPrice(data: any ={}): Observable<any> {
    return this.httpService
      .post(`enterprise/position_invitation_jobs`,data)
      .map(res => res.json())
  }






}
