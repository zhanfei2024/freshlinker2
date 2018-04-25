import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {URLSearchParams, Http} from "@angular/http";
import {HttpService} from "../../../common/http/http.service";


export interface IEducation {
  id: number;
  userId: number;
  educationLevelId: number;
  schoolId: number;
  subject: string;
  description: string;
  graduationYear: number;
  remark?: string;
  gpa?: string;
}

export class Education {
  id: number;
  educationLevelId: number;
  schoolId: number;
  subject: string;
  description: string;
  graduationYear: number;
  remark: string;
  gpa: string;

  constructor(item?: IEducation) {
    if (item) {
      this.id = item.id;
      this.educationLevelId = item.educationLevelId;
      this.description = item.description;
      this.schoolId = item.schoolId;
      this.subject = item.subject;
      this.graduationYear = item.graduationYear;
      this.remark = item.remark;
      this.gpa = item.gpa;

    }
  }
}
export interface ISchool {
  id?: string;
  name?: string;
}

export interface IEducationLevel {
  id?: string;
  name?: string;
  description?: string;
}

export interface IGetEducation {
  result: Education[];
}


@Injectable()
export class UserEducationService {
  public years: number[] = [];
  public myYear: number;
  constructor(private httpService: HttpService) {

  }

  init(): Observable<any> {
    return this.httpService
      .get(`user/users/educations`)
      .map(res => res.json().result)
  }


  get(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/users/self/educations`, options)
      .map(res => res.json())

  }

  getEducationlevels(data: any = {}): Observable<IGetEducation> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/education_levels`, options)
      .map(res => res.json())
  }

  findEducationlevels(id: number, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/education_levels/${id}`, options)
      .map(res => res.json().result)
  }

  getSchools(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/schools`, options)
      .map(res => res.json())
  }

  findSchools(id: number, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/schools/${id}`, options)
      .map(res => res.json().result)
  }

  find(id: string, data: any = {}): Observable<IEducation> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`user/users/self/educations/${id}`, options)
      .map(res => res.json().result)
  }

  delete(id: number): Observable<any> {
    return this.httpService
      .delete(`user/users/self/educations/${id}`)
      .map(res => res.json().result)
  }

  store(data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/users/self/educations`, data)
      .map(res => res.json().result)
  }

  update(data: any = {}): Observable<any> {
    return this.httpService
      .put(`user/users/self/educations/${data['id']}`, data)
      .map(res => res.json().result)
  }

  getYears() {

    // create date
    let myDate = new Date();
    this.myYear = myDate.getFullYear() + 5;
    for (let i = 1965; i <= this.myYear; i++) {
      this.years.push(i);
    }
    return this.years;
  }

}
