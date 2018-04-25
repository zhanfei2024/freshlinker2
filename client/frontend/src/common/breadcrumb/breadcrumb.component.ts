import {Component, OnInit} from '@angular/core';
import {IBread, BreadcrumbService} from './breadcrumb.service';


@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements OnInit {
    public breadcrumb: IBread[];
    constructor(private breadcrumbService: BreadcrumbService) {
    }

    ngOnInit(): void {
        this.breadcrumb = this.breadcrumbService.get();
    }

}
