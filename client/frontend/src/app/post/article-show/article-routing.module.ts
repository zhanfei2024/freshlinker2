import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {PostFindResolve} from "../post-resolve.service";
import {ArticleShowComponent} from "./article-show.component";



const routes: Routes = [
  {
    path: '',
    component: ArticleShowComponent,
    resolve: {
      postFindResolve: PostFindResolve,
    }
  },
  // {
  //   path: '',
  //   component: PostComponent,
  // }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
})

export class ArticleShowRoutingModule {

}
