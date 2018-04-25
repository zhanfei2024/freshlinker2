import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {PositionListComponent} from './position-list/position-list.component';


const routes: Routes = [
      {
        path: '',
        component: PositionListComponent
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

export class PositionRoutingModule {

}
