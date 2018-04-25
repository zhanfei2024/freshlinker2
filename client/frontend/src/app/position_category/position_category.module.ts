import {NgModule} from '@angular/core';
import {PositionCategoryComponent} from './position_category.component';
import {Position_categoryRoutingModule} from "./position_category-routing.module";
import {SharedModule} from '../../common/shared/shared.module';
import {SearchModule} from '../search/search.module';


@NgModule({
  imports: [
    Position_categoryRoutingModule,
    SharedModule,
    SearchModule,
  ],
  declarations: [
    PositionCategoryComponent
  ],
  providers: [

  ]
})

export class PositionCategoryModule {

}
