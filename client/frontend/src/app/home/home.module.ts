import {NgModule} from '@angular/core';
import {HomeComponent} from './home.component';
import {SharedModule} from '../../common/shared/shared.module';
import {HomeRoutingModule} from "./home-routing";
import {SearchModule} from "../search/search.module";


@NgModule({
  imports: [
    HomeRoutingModule,
    SharedModule,
    SearchModule,

  ],
  declarations: [
    HomeComponent
  ],
  providers: [

  ]
})

export class HomeModule {

}
