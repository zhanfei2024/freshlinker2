import {Injectable} from "@angular/core";
import {HttpService, IMeta} from "../../common/http/http.service";
import {Observable} from "rxjs";
import {URLSearchParams, Http} from "@angular/http";
import * as moment from "moment";
import * as _ from "lodash";

export interface ICountry {
    id: number;
    parentId?: number;
    depth?: number;
    code?: string;
    name?: string;
}

@Injectable()
export class CountryService {
    constructor(private httpService: HttpService) {

    }

    get(data: any = {}): Observable<any> {
        let options = {
            search: new URLSearchParams(decodeURI(this.httpService.objectToParams(data)))
        };
        return this.httpService
            .get(`public/countries`, options)
            .map(res => res.json())

    }

    find(id:string, data: any = {}): Observable<any> {
        let options = {
            search: new URLSearchParams(this.httpService.objectToParams(data))
        };

        return this.httpService
            .get(`public/countries/${id}`, options)
            .map(res => res.json().result)
    }

    update(id:string, data: any = {}): Observable<any> {
        let options = {
            search: new URLSearchParams(this.httpService.objectToParams(data))
        };

        return this.httpService
            .put(`public/countries/${id}`, options)
            .map(res => res.json().result)
    }

    store( data: any = {}): Observable<ICountry> {
        let options = {
            search: new URLSearchParams(this.httpService.objectToParams(data))
        };

        return this.httpService
            .post(`public/countries/`, options)
            .map(res => res.json().result)
    }

    destroy(id:string): Observable<any> {

        return this.httpService
            .delete(`public/countries/${id}`)
            .map(res => res.json().result)
    }





}
