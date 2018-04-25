import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams, Http} from "@angular/http";
import * as moment from "moment";
import * as _ from "lodash";
import {HttpService} from "../../../common/http/http.service";
import {ILocation} from "../../../common/service/location.service";
import {IPositionCategory} from "../../company/service/company-position.service";



export interface IExpect {
  id?: string;
  userId?: string;
  expectPositionId?: string;
  content?: string;
  type?: string;
  salaryType?: string;
  minSalary?: number;
  maxSalary?: number;
  locationId?: string;
  expectPosition?: IPositionCategory;
  jobNatureId?: string;
  location: ILocation;
}

export class Expect {
  id: string;
  userId: string;
  expectPositionId: string;
  content: string;
  type: string;
  salaryType: string;
  minSalary: number;
  maxSalary: number;
  locationId?: string;
  expectPosition: IPositionCategory;
  jobNatureId: string;
  location: ILocation;

  constructor(item?: IExpect) {
    if (item) {
      this.id = item.id;
      this.userId = item.userId;
      this.expectPositionId = item.expectPositionId;
      this.type = item.type;
      this.salaryType = item.salaryType;
      this.minSalary = item.minSalary;
      this.maxSalary = item.maxSalary;
      this.locationId = item.locationId;
      this.expectPosition = item.expectPosition;
      this.jobNatureId = item.jobNatureId;
      this.location = item.location;
      this.content = item.content;

    }
  }
}

export interface IGetExpect {
  result: Expect[];
}


@Injectable()
export class UserExpectService {
  constructor(private httpService: HttpService) {

  }

  init(): Observable<any> {
    return this.httpService
      .get(`user/users/self/expect_jobs`)
      .map(res => res.json().result)
  }


  get(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/users/self/expect_jobs`, options)
      .map(res => res.json())

  }

  find(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`user/users/self/expect_jobs/${id}`, options)
      .map(res => res.json().result)
  }

  delete(id: number): Observable<any> {
    return this.httpService
      .delete(`user/users/self/expect_jobs${id}`)
      .map(res => res.json().result)
  }

  store(data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/users/self/expect_jobs`, data)
      .map(res => res.json().result)
  }

  update(data: any = {}): Observable<any> {
    return this.httpService
      .put(`user/users/self/expect_jobs/${data['id']}`, data)
      .map(res => res.json().result)
  }


}
