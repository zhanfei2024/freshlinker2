import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpService} from "../../common/http/http.service";
import { URLSearchParams } from "@angular/http";

export interface IPositionCategory {
  id?: string;
  name?: string;
  description?: string;
  children?: IPositionCategory[];
  parentId?: string;
  result?: IPositionCategory[];
}


@Injectable()
export class PositionCategoryService {

  constructor(private httpService: HttpService) {
  }

  get(data: any = {}): Observable<IPositionCategory> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/position_categories`, options)
      .map(res => res.json())
  }

  find(id: string, data: any = {}): Observable<IPositionCategory> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };

    return this.httpService
      .get(`public/position_categories/${id}`, options)
      .map(res => res.json().result)
  }

  getPositionCategory(data: any = {}): Observable<IPositionCategory> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/position_categories/tree`, options)
      .map(res => res.json())
  }

}
