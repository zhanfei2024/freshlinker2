import {NgModule} from "@angular/core";
import {PaginationModule} from "ngx-bootstrap";
import {SharedModule} from "../../../common/shared/shared.module";
import {SearchModule} from "../../search/search.module";
import {PostService} from "../post.service";
import {UserPostService} from "../../user/user_article/user_article.service";
import {PostListComponent} from "./post-list.component";
import {PostListRoutingModule} from "./post-list-routing.module";
import {UserService} from "../../user/user.service";






@NgModule({
    imports: [
        PostListRoutingModule,
        PaginationModule,
        SharedModule,
        SearchModule,
    ],
    declarations: [
      PostListComponent,
    ],
    providers: [
        PostService,
        UserService,
        UserPostService
    ]
})

export class PostListModule {

}
