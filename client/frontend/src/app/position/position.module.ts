import {NgModule} from "@angular/core";
import {PositionRoutingModule} from "./position-routing.module";
import {PositionListComponent} from './position-list/position-list.component';
import {PositionService} from './position.service';
import {SharedModule} from "../../common/shared/shared.module";
import {DialogService} from "../../common/dialog/dialog.service";
import {PositionQuestionService} from "./position.question.service";
import {SearchModule} from "../search/search.module";
import {PositionFindResolve} from "./position-resolve.service";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {ChartsModule} from "ng2-charts";
import {ModalModule} from "ngx-bootstrap";
import {UserService} from "../user/user.service";
import {UserPostService} from "../user/user_article/user_article.service";


@NgModule({
  imports: [
    PositionRoutingModule,
    InfiniteScrollModule,
    ChartsModule,
    ModalModule,
    SearchModule,
    SharedModule

  ],
  declarations: [
    PositionListComponent,
  ],
  providers: [
    DialogService,
    PositionService,
    PositionQuestionService,
    PositionFindResolve,
    UserService,
    UserPostService
  ],

})

export class PositionModule {

}
