import {Component, OnInit}            from '@angular/core';
// import {HrToasterConfig} from "../toaster/toaster-config";
// import {Auth} from "../../app/auth/auth.service";
import {ToasterService} from "angular2-toaster";
import {Router} from '@angular/router';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {

    constructor(// private auth: Auth,
        private router: Router,
        private toasterService: ToasterService,) {
    }

    public disabled: boolean = false;
    public status: {isopen: boolean} = {isopen: false};

    goState(state: string) {
        switch (state) {
            case 'jobs':
                this.router.navigate(['position_category']);
                window.scrollTo(0,0);
                break;
            case 'industry_feed':
                this.router.navigate(['/about/industry_feed']);
                break;
        }

    }

    ngOnInit(): void {

    }


    public toggleDropdown($event: MouseEvent): void {
        $event.preventDefault();
        $event.stopPropagation();
        this.status.isopen = !this.status.isopen;
    }

    public logout(): void {
        // this.auth.logout();
        this.toasterService.pop('success', 'Success', 'Logout!!');
        // this.router.navigate(['/auth/login']);
    }

}
