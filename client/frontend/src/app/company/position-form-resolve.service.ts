import {Injectable}             from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {CompanyPositionService} from "./service/company-position.service";

@Injectable()
export class PositionFormFindResolve implements Resolve<any> {
  constructor(private companyPositionService: CompanyPositionService, private router: Router) {
  };

  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    let companyId = route.params['companyId'];
    let positionId = route.params['positionId'];
    try {
      return await this.companyPositionService.find(companyId,positionId).toPromise();
    } catch (err) {
      this.router.navigate(['company',companyId,'position-list']);
      return null;
    }

  }
}


