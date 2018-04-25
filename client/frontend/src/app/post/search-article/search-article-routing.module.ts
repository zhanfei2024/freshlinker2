import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {SearchArticleComponent} from "./search-article.component";



const routes: Routes = [
  {
    path: '',
    component: SearchArticleComponent
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

export class SearchArticleRoutingModule {

}
