import {NgModule} from "@angular/core";
import {ArticleShowRoutingModule} from "./article-routing.module";
import {ModalModule, PaginationModule} from "ngx-bootstrap";
import {SharedModule} from "../../../common/shared/shared.module";
import {SearchModule} from "../../search/search.module";
import {ArticleShowComponent} from "./article-show.component";
import {PostFindResolve} from "../post-resolve.service";
import {PostService} from "../post.service";
import {UserPostService} from "../../user/user_article/user_article.service";
import {QuillEditorModule } from 'ngx-quill-editor';
import {ShareButtonsModule, ShareButtonsService} from "ngx-sharebuttons";
import {WindowService} from "ngx-sharebuttons/services/window.service";

@NgModule({
    imports: [
        ArticleShowRoutingModule,
        QuillEditorModule,
        ModalModule,
        PaginationModule,
        SharedModule,
        SearchModule,
      ShareButtonsModule

    ],
    declarations: [
      ArticleShowComponent,
    ],
    providers: [
        PostService,
        PostFindResolve,
        UserPostService,
        ShareButtonsService,
        WindowService

    ]
})

export class ArticleShowModule {

}
