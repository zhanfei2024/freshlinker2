import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {PostFindResolve} from "../post-resolve.service";
import {InterlocutionShowComponent} from "./interlocution-show.component";



const routes: Routes = [
  {
    path: '',
    component: InterlocutionShowComponent,
    resolve: {
      interlocutionFindResolve: PostFindResolve
    }
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
})

export class InterlocutionShowRoutingModule {

}
