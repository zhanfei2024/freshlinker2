import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {I18nService} from "../i18n/i18n.service";


@Injectable()
export class SelfObservableService {
  subject = new Subject<any>();
  self$ = this.subject.asObservable();
  self: any = {};

  constructor(private i18nService: I18nService) {

  }

  set(user: any) {
    this.self = user;
    this.i18nService.setLanguage(this.self.setting ? this.self.setting.language : '');
    this.subject.next(this.self);
  }
}
