import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams} from "@angular/http";
import {EnterpriseHttpService} from "../../../common/http/enterprise.http.service";

export interface IPosition {
  id?: string;
  active?: boolean;
  name?: string;
  type?: string;
  minSalary?: number;
  maxSalary?: number;
  educationLevelId?: number;
  locationId?: number;
  temptation?: string;
  experience?: string;
  address?: string;
  categoryIds?: Array<number>;
  categories?: Array<any>;
  email?: string;
  salaryType: string;
  companyId?: string;
  description?: string;
  skills?: any;
  tags?: any;
  jobNatureId?: number;
  locations?: any;
  expiredDate?: Date;
}

export class Position {
  id: string;
  active: boolean;
  name: string;
  type: string;
  minSalary: number;
  maxSalary: number;
  educationLevelId: number;
  locationId: number;
  temptation: string;
  address: string;
  experience: string;
  categoryIds: Array<number>;
  categories: Array<any>;
  email: string;
  salaryType: string;
  companyId: string;
  description: string;
  skills: any;
  tags: any;
  jobNatureId: number;
  locations: any;
  expiredDate?: Date;

  constructor(item?: IPosition) {
    if (item) {
      this.id = item.id;
      this.active = item.active;
      this.minSalary = item.minSalary;
      this.type = item.type;
      this.maxSalary = item.maxSalary;
      this.educationLevelId = item.educationLevelId;
      this.locationId = item.locationId;
      this.temptation = item.temptation;
      this.experience = item.experience;
      this.address = item.address;
      this.categoryIds = item.categoryIds;
      this.categories = item.categories;
      this.email = item.email;
      this.tags = item.tags;
      this.email = item.email;
      this.salaryType = item.salaryType;
      this.companyId = item.companyId;
      this.description = item.description;
      this.skills = item.skills;
      this.tags = item.tags;
      this.jobNatureId = item.jobNatureId;
      this.locations = item.locations;
      this.expiredDate = item.expiredDate;
    }
  }
}

export interface IMeta {
  pagination?: {
    count?: number,
    currentPage?: number,
    nextPage?: number,
    prevPage?: number
    totalCount?: number,
  }
}

interface IGetPosition {
  status: boolean,
  meta?: IMeta,
  result: IPosition[]
}


export interface IPositionCategory {
  id?: string;
  parentId?: number;
  depth?: number;
  name?: string;
  description?: string;
  categories?: any;
}

export interface IExperience {
  id?: number;
  value?: string;
  name?: string;

}


@Injectable()
export class CompanyPositionService {
  constructor(private httpService: EnterpriseHttpService) {
  }


  getPositionCategory(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };

    return this.httpService
      .get(`public/position_categories`, options)
      .map(res => res.json())
  }

  // without enterprise login
  get(data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`public/positions`, options)
      .map(res => res.json().result)
  }

  getEnterprisePositionByCompany(id: string, data: any = {}): Observable<IGetPosition> {
    let options = {
      params: new URLSearchParams(decodeURIComponent(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`enterprise/companies/${id}/positions`, options)
      .map(res => res.json())
  }

  getPublicCompanyPosition(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`public/companies/${id}/positions`, options)
      .map(res => res.json().result)
  }

  find(id: string, positionId: string, data: any = {}): Observable<IPosition> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`enterprise/companies/${id}/positions/${positionId}`, options)
      .map(res => res.json().result)
  }

  getChart(id: string, data: any = {}): Observable<any> {
    let options = {
      params: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`enterprise/positions/${id}/chart`, options)
      .map(res => res.json().result)
  }


  backOnlinePosition(companyId: string, positionId: string, data: any = {}): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${companyId}/positions/${positionId}/renew`, data)
      .map(res => res.json().result)
  }

  destroy(companyId: string, id: string): Observable<any> {
    return this.httpService
      .delete(`enterprise/companies/${companyId}/positions/${id}`)
      .map(res => res.json().result)
  }

  updatePosition(companyId: string,id:string, data: any = {}): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${companyId}/positions/${id}`, data)
      .map(res => res.json().result)
  }

  update(companyId: string, data: any = {}): Observable<any> {
    return this.httpService
      .put(`enterprise/companies/${companyId}/positions/${data['id']}`, data)
      .map(res => res.json().result)
  }


  store(companyId: string, data: any = {}): Observable<any> {
    return this.httpService
      .post(`enterprise/companies/${companyId}/positions`, data)
      .map(res => res.json().result)
  }


}
