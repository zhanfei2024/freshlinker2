import {NgModule} from "@angular/core";
import {ModalModule, PaginationModule} from "ngx-bootstrap";
import {SharedModule} from "../../../common/shared/shared.module";
import {SearchModule} from "../../search/search.module";
import {PostFindResolve} from "../post-resolve.service";
import {PostService} from "../post.service";
import {UserPostService} from "../../user/user_article/user_article.service";
import {QuillEditorModule } from 'ngx-quill-editor';
import {InterlocutionShowRoutingModule} from "./interlocution-show-routing.module";
import {InterlocutionShowComponent} from "./interlocution-show.component";
import {ShareButtonsModule, ShareButtonsService} from "ngx-sharebuttons";
import {WindowService} from "ngx-sharebuttons/services/window.service";






@NgModule({
    imports: [
      InterlocutionShowRoutingModule,
        QuillEditorModule,
        ModalModule,
        PaginationModule,
        SharedModule,
        SearchModule,
        ShareButtonsModule
    ],
    declarations: [
      InterlocutionShowComponent,
    ],
    providers: [
        PostService,
        PostFindResolve,
        UserPostService,
        ShareButtonsService,
        WindowService
    ]
})

export class InterlocutionShowModule {

}
