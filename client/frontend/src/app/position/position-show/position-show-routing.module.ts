import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {PositionShowComponent} from "./position-show.component";
import {PositionFindResolve} from "../position-resolve.service";


const routes: Routes = [
  {
    path: '',
    component: PositionShowComponent,
    resolve: {
      positionFindResolve: PositionFindResolve
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],

})

export class PositionShowRoutingModule {

}
