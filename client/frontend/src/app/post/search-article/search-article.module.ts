import {NgModule} from "@angular/core";
import {PaginationModule} from "ngx-bootstrap";
import {SharedModule} from "../../../common/shared/shared.module";
import {SearchModule} from "../../search/search.module";
import {PostService} from "../post.service";
import {UserPostService} from "../../user/user_article/user_article.service";
import {UserService} from "../../user/user.service";
import {SearchArticleRoutingModule} from "./search-article-routing.module";
import {SearchArticleComponent} from "./search-article.component";






@NgModule({
    imports: [
        SearchArticleRoutingModule,
        PaginationModule,
        SharedModule,
        SearchModule,
    ],
    declarations: [
        SearchArticleComponent,
    ],
    providers: [
        PostService,
        UserService,
        UserPostService
    ]
})

export class SearchArticleModule {

}
