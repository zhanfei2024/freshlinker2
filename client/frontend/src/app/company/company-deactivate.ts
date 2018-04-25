import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {CompanyFormComponent} from './company-form/company-form.component';

@Injectable()

export class CompanyDeactivate implements CanDeactivate<CompanyFormComponent> {
  public close: boolean;
  canDeactivate(
    component: CompanyFormComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot,
  ): Observable<boolean>|boolean {
    return confirm('请确定是否要离开或提交？')
  }
}
