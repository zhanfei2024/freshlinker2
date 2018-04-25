import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {BreadcrumbComponent} from "./breadcrumb.component";
import {RouterModule, Routes} from '@angular/router';
import { BreadcrumbService } from './breadcrumb.service';
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        TranslateModule,

    ],
    providers: [
        BreadcrumbService,
    ],
    declarations: [
        BreadcrumbComponent
    ],
    exports: [
        BreadcrumbComponent
    ]
})
export class BreadcrumbModule {
}
