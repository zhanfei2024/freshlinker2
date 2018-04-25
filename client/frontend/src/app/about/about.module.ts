import {NgModule} from "@angular/core";
import {AboutRoutingModule} from "./about-routing.module";
import {AboutComponent} from "./about.component";
import {AboutUsComponent} from "./aboutUs/aboutUs.component";
import {OurStoryComponent} from './ourStory/ourStory.component';
import {JobsComponent} from './jobs/jobs.component';
import {SharedModule} from "../../common/shared/shared.module";
import {DialogService} from "../../common/dialog/dialog.service";
import {MediaReportComponent} from "./mediaReport/mediaReport.component";
import {IndustryFeedComponent} from "./industry_feed/industry_feed.component";
import {ContactComponent} from "./contact/contact.component";
import {PrivacyComponent} from "./privacy/privacy.component";
import {CareerComponent} from "./career/career.component";
import {TermsConditionsComponent} from "./terms_conditions/termsConditions.component";
import {AboutNavBarComponent} from "./aboutNavbar/aboutNavbar.component";
import {JobFlatFormComponent} from "./job_flatform/job_flatform.component";


@NgModule({
    imports: [
        AboutRoutingModule,
        SharedModule
    ],
    declarations: [
        AboutComponent,
        AboutUsComponent,
        OurStoryComponent,
        JobsComponent,
        MediaReportComponent,
        IndustryFeedComponent,
        ContactComponent,
        PrivacyComponent,
        CareerComponent,
        TermsConditionsComponent,
        AboutNavBarComponent,
        JobFlatFormComponent
    ],
    providers: [
        DialogService
    ]
})

export class AboutModule {

}
