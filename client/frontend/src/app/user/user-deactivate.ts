import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {UserInformationComponent} from './user-information/user-information.component';

@Injectable()

export class CanUserDeactivate implements CanDeactivate<UserInformationComponent> {
  canDeactivate(component: UserInformationComponent,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState: RouterStateSnapshot
                ): Observable<boolean>|boolean {
    return confirm('请确定是否要离开或提交？')
  }
}
