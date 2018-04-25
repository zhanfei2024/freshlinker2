import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {PostListComponent} from "./post-list.component";



const routes: Routes = [
  {
    path: '',
    component: PostListComponent
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

export class PostListRoutingModule {

}
