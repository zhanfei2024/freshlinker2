import {Injectable} from '@angular/core';
import {HttpService} from '../../common/http/http.service';
import {Observable} from 'rxjs';
import {URLSearchParams} from '@angular/http';
import {IPositionCategory} from "../position_category/position_category.service";

export interface IPosition {
  id?: string;
  candidates?: ICandidate[];
  categories?: ICategory[];
  company: ICompany;
  companyId?: string;
  name?: string;
  type?: string;
  minSalary?: string;
  maxSalary?: string;
  educationId?: string;
  temptation?: string;
  experience?: string;
  address?: string;
  description?: string;
  educationLevel?: IEducationLevel;
  educationLevelId: number;
  updatedAt?: Date;
  createdAt?: Date;
  email?: string;
  expiredDate?: Date;
  salaryType?: string;
  bookmarkStatus?: boolean;
  jobNatures: IJobNature;
  jobNatureId?: number;
  location: ILocation;
  locationId: number;
  skills?: any;
  status?: any;
  tags?: any;
  view?: number;
  isApplied?: boolean;
  answerNum?: number;
  pastNum?: number;
  positionQuestion?: IPositionQuestion[];
  positionAnswer?: IQuestion[];
  isCheckApply?: boolean;
}

export interface IJobNature {
  id?: number;
  name?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILocation {
  depth?: number;
  id: number;
  name: string;
  order?: number;
  parentId?: number;
}

export interface IExperience {
  id: number;
  value?: string;
  name?: string;
}

export interface ISkill {
  id?: string;
  name?: string;
  text?: string;
}

export interface IFilter {

  sorting?: string;
  search?: string;
  status?: string;
  categoryId?: number;
  companyId?: string;
  positionId?: string;
  candidateStatusId?: number;
  active?: boolean;
  minExpiredDate?: string;
  maxExpiredDate?: string;
  tags?: string;
  categoryIds?: IPositionCategory[];
  minSalary?: number;
  maxSalary?: number;
  salaryType?: string;
  educationLevelIds?: IEducationLevel[];
  experience?: string;
  type?: string;
  locationIds?: ILocation[];
  jobNatureId?: number;
  page: number;
  limit: number;

}

export interface ICompany {
  id: number;
  address?: string;
  background?: string;
  countryId?: number;
  createdAt?: Date;
  deletedAt?: Date;
  description?: string;
  enterpriseId?: number;
  field?: string;
  foundingTime?: string;
  isApproved: boolean;
  name: string;
  scale?: string;
  stage?: string;
  updatedAt?: Date;
  url?: string;
  view?: number;
}

export interface ICategory {
  id: number;
  name: string;
  parentId?: number;
}

export interface ICandidate {
  id: number;
  isInvitation: boolean;
  isRead: boolean;
  positionId: number;
  userId: number;
  candidateStatusId: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  appliedAt: Date;
}

export interface IEducationLevel {
  createdAt: Date;
  description?: string;
  id: number;
  name: string;
  order?: number;
  updatedAt: Date;
}

export interface ITag {
  count?: number;
  id: number;
  name: string;
  slug?: string;
}

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ITab {
  id: number;
  name: string;
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

export interface IPositionQuestion {
  createdAt?: Date;
  updatedAt?: Date;
  id: number;
  isAttachment?: boolean;
  isRequired?: boolean;
  positionId: number;
  question: string;
  answer?: string;
}

export interface IQuestion {
  questionId: string,
  answer: string
}


interface IGetPosition {
  status: boolean,
  meta?: IMeta,
  result: IPosition[]
}

interface IGetTag {
  status: boolean,
  meta: IMeta,
  result: ITag[]
}

export interface IChart {
  description?: string;
  value?: string;
  name?: string;
}


@Injectable()
export class PositionService {
  constructor(private httpService: HttpService) {
  }

  get(data: any = {}): Observable<IGetPosition> {
    let options = {
      search: new URLSearchParams(decodeURIComponent(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`public/positions`, options)
      .map(res => res.json())
  }

  getTags(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/tags`, options)
      .map(res => res.json())
  }

  getBookMark(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(decodeURIComponent(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`user/bookmarks`, options)
      .map(res => res.json())
  }

  getFindCategroyPosition(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/position_categories/${id}`, options)
      .map(res => res.json().result)
  }


  checkBookMark(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`user/positions/${id}/bookmark`, options)
      .map(res => res.json().result)
  }

  collectBookMark(id: string): Observable<any> {
    return this.httpService
      .post(`user/positions/${id}/bookmark`)
      .map(res => res.json().result)
  }

  removeBookMark(id: string): Observable<IPosition> {
    return this.httpService
      .delete(`user/positions/${id}/bookmark`)
      .map(res => res.json().result)
  }

  checkApplyPosition(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`user/positions/${id}/check`, options)
      .map(res => res.json().result)
  }

  getQuestion(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`user/positions/${id}/questions`, options)
      .map(res => res.json().result)
  }

  applyPosition(id: string, data: IQuestion[]): Observable<any> {
    return this.httpService
      .post(`user/positions/${id}/apply`, {'question': data})
      .map(res => res.json().result)
  }

  userApplyPosition(id: string, positionId: string, data: IQuestion[]): Observable<any> {
    return this.httpService
      .post(`user/position_invitations/${id}/apply`, {'question': data, 'positionId': positionId})
      .map(res => res.json().result)
  }


  rejectPositionInvite(id: string, data: any = {}): Observable<any> {
    return this.httpService
      .post(`user/position_invitations/${id}/reject`, data)
      .map(res => res.json())
  }


  getOtherPosition(id: string, data: any = {}): Observable<IGetPosition> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/companies/${id}/positions`, options)
      .map(res => res.json())
  }

  // educationChart,experienceChart

  getChart(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/positions/${id}/chart`, options)
      .map(res => res.json())
  }


  find(id: string, data: any = {}): Observable<IPosition> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/positions/${id}`, options)
      .map(res => res.json().result)

  }

  getRelatedPosition(data: any = {}): Observable<IGetPosition> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get('public/positions/by_similar_position', options)
      .map(res => res.json())
  }

  getByUserAppliedPositionCandidateNum(data: any = {}): Observable<IGetPosition> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get('user/candidates/list', options)
      .map(res => res.json())
  }

  getByUserAppliedPosition(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(decodeURIComponent(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get('user/candidates', options)
      .map(res => res.json())
  }

  getPositionInvitations(data: any = {}): Observable<IGetPosition> {
    let options = {
      search: new URLSearchParams(decodeURIComponent(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get(`user/position_invitations`, options)
      .map(res => res.json())
  }

  getPositionCategory(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/position_categories/tree`, options)
      .map(res => res.json())
  }

  getjobNatures(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/jobNatures`, options)
      .map(res => res.json())
  }

  findJobNature(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/jobNatures/${id}`, options)
      .map(res => res.json())
  }


  getPositionClickNum(positionId: string, data: any = {}): Observable<any> {
    return this.httpService
      .post(`public/positions/${positionId}/click_traffic`, data)
      .map(res => res.json())
  }

}
