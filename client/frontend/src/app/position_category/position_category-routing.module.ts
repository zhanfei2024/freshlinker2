import {PositionCategoryComponent} from './position_category.component';
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";

const routes: Routes = [
  { path: '', component: PositionCategoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Position_categoryRoutingModule { }



