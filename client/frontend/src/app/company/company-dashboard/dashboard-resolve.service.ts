import {Injectable}             from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {DashboardService} from "./company-dashboard.service";

@Injectable()
export class DashboardFindResolve implements Resolve<any> {
  constructor(private dashboardService: DashboardService, private router: Router) {
  };

  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    let id = route.params['id'];
    try {
      return await this.dashboardService.findCompany(id).toPromise();
    } catch (err) {
      this.router.navigate(['company/company-edit']);
      return null;
    }

  }
}


