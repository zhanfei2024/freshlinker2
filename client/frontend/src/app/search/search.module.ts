import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {searchService} from './search.service';
import {searchComponent} from './search.component';
import {SharedModule} from "../../common/shared/shared.module";
import {ComponentLoaderFactory, PositioningService, TypeaheadModule} from 'ngx-bootstrap';
import {SliderModule} from 'primeng/primeng';





@NgModule({
    imports: [
      CommonModule,
      SharedModule,
      TypeaheadModule,
      SliderModule
    ],
    declarations: [
      searchComponent,
    ],
    providers: [
      searchService,
      ComponentLoaderFactory,
      PositioningService
    ],
    exports: [
      searchComponent,

    ]
})

export class SearchModule {

}

