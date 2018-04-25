import {Injectable} from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {PositionService, IPosition} from './position.service';

@Injectable()
export class PositionFindResolve implements Resolve<IPosition> {
  constructor(private positionService: PositionService, private router: Router){
  };

  async resolve(router: ActivatedRouteSnapshot): Promise<any>{
    let id = router.params['id'];
    try{
      return await this.positionService.find(id).toPromise();
    } catch (err){
      this.router.navigate(['/position-list']);
      return null;
    }

  }
}
