import {NgModule} from "@angular/core";
import {PositionShowRoutingModule} from "./position-show-routing.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {ChartsModule} from "ng2-charts";
import {ModalModule} from "ngx-bootstrap";
import {SearchModule} from "../../search/search.module";
import {SharedModule} from "../../../common/shared/shared.module";
import {PositionShowComponent} from "./position-show.component";
import {PositionService} from "../position.service";
import {PositionQuestionService} from "../position.question.service";
import {PositionFindResolve} from "../position-resolve.service";
import {UserService} from "../../user/user.service";
import {UserPostService} from "../../user/user_article/user_article.service";



@NgModule({
  imports: [
    PositionShowRoutingModule,
    InfiniteScrollModule,
    ChartsModule,
    ModalModule,
    SearchModule,
    SharedModule

  ],
  declarations: [
    PositionShowComponent,
  ],
  providers: [
    PositionService,
    PositionQuestionService,
    PositionFindResolve,
    UserService,
    UserPostService
  ],

})

export class PositionShowModule {

}
