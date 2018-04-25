import {Injectable}             from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {Auth} from "./auth.service";

@Injectable()
export class CompanyLoginCheckResolve implements Resolve<Boolean> {

  constructor(private auth: Auth, private router: Router) {
  }

  async resolve(route: ActivatedRouteSnapshot): Promise<Boolean> {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/auth/enterprise_login']);
      return null;
    }
  }
}
