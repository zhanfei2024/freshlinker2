import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from '../../common/http/http.service';
import { URLSearchParams } from "@angular/http";

@Injectable()
export class HomeService {

  constructor(private httpService: HttpService) {
  }

  getInvitation(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get('public/positionInvitation/positions', options)
      .map(res => res.json())
  }

  getBanner(id: string, data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(this.httpService.objectToParams(data))
    };
    return this.httpService
      .get(`public/settings/${id}`, options)
      .map(res => res.json())
  }

}
