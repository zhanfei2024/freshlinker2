import {Injectable} from "@angular/core";
import {Auth} from "../../auth/auth.service";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import * as _ from "lodash";
import {EnterpriseHttpService} from "../../../common/http/enterprise.http.service";

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
  isVIP?:boolean;
}

export interface IStage {
  id?: string;
  value?: string;
}

export interface IScale {
  id?: string;
  name?: string;
  value?: string;
}

export interface IExperience {
  data?: number;
  name?: string;
}
export interface  IPicture {
  id?: number;
  thumbUrl?: string;
  url?: string;
}

export interface IPictures {
  id?: number;
  isCover?: boolean;
  isIcon?: boolean;
  url: any;
}

export interface IAccount {
  limit?: number;
  page?: number;
  startedDate?: string;
  endedDate?: string;
  search?:string;
}



@Injectable()
export class CompanyService {
  public scales: IScale[] = [];
  constructor(private httpService: EnterpriseHttpService,) {
  }


  // get company without login
  get(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`public/companies`, options)
      .map(res => res.json())
  }

  // get user's company data
  findCompanyByUser(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`enterprise/companies/self`, options)
      .map(res => res.json())
  }


  getEnterprise(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`enterprise/enterprises/self`, options)
      .map(res => res.json())
  }

  getCompanyClickNum(companyId:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .post(`public/companies/${companyId}/click_traffic`, options)
      .map(res => res.json())
  }


  findCompanyPositions(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/${id}/positions`, options)
      .map(res => res.json().result)
  }

  store(data: any = {}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies`, data)
      .map(res => res.json().result)
  }

  update(data: any = {}): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${data['id']}`, data)
      .map(res => res.json().result)
  }

  getDynamics(id:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`enterprise/companies/${id}/companyDynamics`, options)
      .map(res => res.json())
  }

  getEVideo(id:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`enterprise/companies/${id}/files`, options)
      .map(res => res.json())
  }

  getVideo(id:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`public/companies/${id}/files`, options)
      .map(res => res.json())
  }

  storeDynamics(id:string,data: any = {}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies/${id}/companyDynamics`, data)
      .map(res => res.json().result)
  }

  storeVideo(id:string,data: any = {}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies/${id}/video`, data)
      .map(res => res.json().result)
  }

  destroyDynamics(companyId: string,dynamicsId:string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}/companyDynamics/${dynamicsId}`)
      .map(res => res.json().result)
  }


  getCompany(companyId:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/${companyId}`, options)
      .map(res => res.json().result)
  }

  // without login get company data
  find(companyId: string): Observable<any> {
    return this.httpService
      .get(`public/companies/${companyId}`)
      .map(res => res.json().result)
  }

  destroy(companyId: string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}`)
      .map(res => res.json().result)
  }

  getCompanyPictures(id:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/${id}/pictures`, options)
      .map(res => res.json().result)
  }

  getPublicCompanyPictures(id:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/companies/${id}/pictures`, options)
      .map(res => res.json().result)
  }

  getPictures(id:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/companies/${id}/pictures`, options)
      .map(res => res.json())
  }

  destroyPictures(companyId: string,id:string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}/pictures/${id}`)
      .map(res => res.json().result)
  }


  getBigPicture(pictures: IPictures[], loadPictures: IPicture[]) {
    _.each(pictures, (value: IPictures) =>{
      let index = _.findIndex(loadPictures, {id: value.id});
      if(index === -1) loadPictures.push({'id': value.id, 'thumbUrl': value.url['600'],'url': value.url['1024']});
    });
  }

  getAccount(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`enterprise/invoices`, options)
      .map(res => res.json())
  }

  getConsume(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`enterprise/bills`, options)
      .map(res => res.json())
  }


  getCompanyScale () {
    this.scales = [
      {
        id: '1',
        name: '一人公司',
        value: 'myself-only'
      },
      {
        id: '2',
        name: '2-10',
        value: '2-10'
      },
      {
        id: '3',
        name: '11-50',
        value: '11-50'
      },
      {
        id: '4',
        name: '51-200',
        value: '51-200'
      },
      {
        id: '5',
        name: '201-500',
        value: '201-500'
      },
      {
        id: '6',
        name: '501-1000',
        value: '501-1000'
      },
      {
        id: '7',
        name: '1001-5000',
        value: '1001-5000'
      },
      {
        id: '8',
        name: '5001-10000',
        value: '5001-10000'
      },
      {
        id: '9',
        name: '10001+',
        value: '10001+'
      }
    ];
    return this.scales;
  }

  getChatLogin(companyId:string,data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/${companyId}/chat/login`, options)
      .map(res => res.json())
  }

  getChatContent(companyId:string,data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/${companyId}/chat`, options)
      .map(res => res.json())
  }

  getChatUserContent(companyId:string,userId:string,data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/${companyId}/chat/${userId}`, options)
      .map(res => res.json())
  }

  deleteChat(companyId:string,userId:number,): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}/chat/${userId}`)
      .map(res => res.json().result)
  }

  sendContent(companyId:string,userId:string,data: any = {}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies/${companyId}/chat/${userId}`,data)
      .map(res => res.json())
  }

  updateContent(companyId:string,userId:string,data: any = {}): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${companyId}/chat/${userId}`,data)
      .map(res => res.json())
  }

  getReviews(id:string,data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`enterprise/companies/${id}/reviews`, options)
      .map(res => res.json())
  }

  updateMsg(companyId: string,id:string): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${companyId}/reviews/${id}`)
      .map(res => res.json())
  }


}
