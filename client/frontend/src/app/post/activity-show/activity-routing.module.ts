import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {PostFindResolve} from "../post-resolve.service";
import {ActivityShowComponent} from "./activity-show.component";



const routes: Routes = [
  {
    path: '',
    component: ActivityShowComponent,
    resolve: {
      activityFindResolve: PostFindResolve
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

export class ActivityShowRoutingModule {

}
