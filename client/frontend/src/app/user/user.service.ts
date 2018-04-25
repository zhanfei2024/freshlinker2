import {Injectable} from "@angular/core";
import {HttpService, IMeta} from "../../common/http/http.service";
import {Observable} from "rxjs";
import {URLSearchParams, Http} from "@angular/http";
import {TranslateService} from "@ngx-translate/core";

export interface IUser {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  selfDescription?: string;
  phone?: number;
  gender?: string;
  yearOfExperience?: string;
  birth?: any;
  resume?: string;
  nationalityId?: number;
  expectJobs?: any;
  educations?: any;
  experiences?: any;
  languages?: any;
  skills?: any;
  icon?: any;
  result?: any;
}

export class User {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  selfDescription?: string;
  phone?: number;
  gender?: string;
  yearOfExperience?: string;
  birth?: string;
  resume?: string;
  nationalityId?: number;
  expectJobs?: any;
  educations?: any;
  experiences?: any;
  languages?: any;
  skills?: any;
  icon?: any;
  result?: any;


  constructor(item?: IUser) {
    if (item) {
      this.id = item.id;
      this.email = item.email;
      this.firstName = item.firstName;
      this.lastName = item.lastName;
      this.username = item.username;
      this.selfDescription = item.selfDescription;
      this.resume = item.resume;
      this.phone = item.phone;
      this.gender = item.gender;
      this.birth = item.birth;
      this.nationalityId = item.nationalityId;
      this.expectJobs = item.expectJobs;
      this.educations = item.educations;
      this.experiences = item.experiences;
      this.languages = item.languages;
      this.skills = item.skills;
      this.icon = item.icon;

    }
  }

  beforeSubmit() {

  }
}

interface IGetUser {
  status: boolean,
  meta: IMeta,
  result: User[]
}

export interface IExperience {
  id?: number;
  value?: string;
  name?: string;

}

export  interface IDate {
  dateDisabled: boolean,
  formatYear: string,
  maxDate: Date,
  minDate: Date,
  startingDay: number
}

export interface IEducationLevel {
  id?: string;
  name?: string;
  description?: string;
}

@Injectable()
export class UserService {
  public experience: IExperience[] = [];
  public years: number[] = [];
  public myYear: number;

  constructor(private httpService: HttpService,
              private translate: TranslateService) {

  }

  getExperience() {
    this.experience = [
      {
        id: 1,
        value: "0",
        name: this.translate.instant('message.position_experience_no')
      },
      {
        id: 2,
        value: "0.5",
        name: this.translate.instant('message.position_experience_half')
      },
      {
        id: 3,
        value: "1",
        name: 1 + this.translate.instant('message.position_experience_year')
      },
      {
        id: 4,
        value: "2",
        name: 2 + this.translate.instant('message.position_experience_year')
      },
      {
        id: 5,
        value: "3",
        name: 3 + this.translate.instant('message.position_experience_year')
      },
      {
        id: 6,
        value: "4",
        name: 4 + this.translate.instant('message.position_experience_year')
      },
      {
        id: 7,
        value: "5",
        name: this.translate.instant('message.position_experience_5')
      }
    ];
    return this.experience;
  }

  get(data: any = {}): Observable<IGetUser> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/users`, options)
      .map(res => res.json())
      .map(res => {
        res.result = res.result.map((item) => new User(item));
        return res;
      });
  }

  find(data: any = {}): Observable<User> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`user/users/self`, options)
      .map(res => res.json().result)
  }

  findUser(userId: string, data: any = {}): Observable<User> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/users/${userId}`, options)
      .map(res => res.json().result)
  }

  getSkill(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`public/tags`, options)
      .map(res => res.json().result)
  }


  delete(id: number): Observable<User> {
    return this.httpService
      .delete('user/users/' + id)
      .map(res => res.json().result)
      .map(res => new User(res));
  }

  store(data: any = {}): Observable<User> {
    return this.httpService
      .put('user/users/self', data)
      .map(res => res.json().result)
      .map(res => new User(res));
  }

  update(data: any = {}): Observable<IUser> {
    return this.httpService
      .put('user/users/self', data)
      .map(res => res.json().result)
      .map(res => new User(res));
  }

  getCompany(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`public/companies`, options)
      .map(res => res.json().result)
  }

  applicantCompany(data: any = {}): Observable<any> {
    return this.httpService
      .post('user/company/apply', data)
      .map(res => res.json().result)
      .map(res => new User(res));
  }


  checkExpired(expiredDate: Date, currentDate: Date): boolean {
    if (currentDate >= expiredDate) {
      return true
    } else {
      return false
    }
  }

  getYears() {
    // create date
    let myDate = new Date();
    this.myYear = myDate.getFullYear() + 5;
    for (var i = 1965; i <= this.myYear; i++) {
      this.years.push(i);
    }
    return this.years;
  }

  getEducation(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/education_levels`, options)
      .map(res => res.json().result)
  }

  getComparedSkill(positionId:string,data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/skills/positions/${positionId}/skill_compared`, options)
      .map(res => res.json().result)
  }

  getFindEducation(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/education_levels/${id}`, options)
      .map(res => res.json().result)
  }

  getQuestion(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/positions/${id}/questions`, options)
      .map(res => res.json())
  }

  getChatLogin(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/chat/login`, options)
      .map(res => res.json())
  }

  getChatContent(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/chat`, options)
      .map(res => res.json())
  }

  getChatCompanyContent(companyId:string,data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/chat/${companyId}`, options)
      .map(res => res.json())
  }

  sendContent(companyId:string,data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/chat/${companyId}`,data)
      .map(res => res.json())
  }

  updateContent(companyId:string,data: any = {}): Observable<any> {
    return this.httpService
      .put(`user/chat/${companyId}`,data)
      .map(res => res.json())
  }

  deleteChat(companyId:number): Observable<any> {
    return this.httpService
      .delete(`user/chat/${companyId}`)
      .map(res => res.json().result)
  }


  /*获取评论*/
  getRead(data: any = {}): Observable<any> {
    const options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/comments/read`, options)
      .map(res => res.json())
  }

  /*获取评论*/
  getComment(data: any = {}): Observable<any> {
    const options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/comments`, options)
      .map(res => res.json())
  }

  getFindComment(id:string,data: any = {}): Observable<any> {
    const options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`user/posts/${id}/comments`, options)
      .map(res => res.json())
  }

  /*保存评论*/
  storeAnswer(Id: number, data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/comments/${Id}/replies`, data)
      .map(res => res.json())
  }

  /*忽略消息*/
  ignore(Id: number): Observable<any> {
    return this.httpService
      .put(`user/comments/${Id}`)
      .map(res => res.json())
  }

  updateMsg(Id: number): Observable<any> {
    return this.httpService
      .put(`user/comments/${Id}`)
      .map(res => res.json())
  }

  /*筛选评论消息*/
  public itemsFilter(value: any): any {
    let newsItem = [];
    value.forEach((value) => {
      if (value.objectType === 'Post') {
        newsItem.push(value)
      }
    });
    return newsItem;
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return Date.now() < expiresAt;
  }
}
