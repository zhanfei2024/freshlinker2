import {Routes, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {FullLayoutComponent} from "../../common/layouts/full-layout.component";
import {AboutComponent} from "./about.component";
import {AboutUsComponent} from "./aboutUs/aboutUs.component";
import {OurStoryComponent} from './ourStory/ourStory.component';
import {JobsComponent} from './jobs/jobs.component';
import {MediaReportComponent} from './mediaReport/mediaReport.component';
import {IndustryFeedComponent} from "./industry_feed/industry_feed.component";
import {ContactComponent} from "./contact/contact.component";
import {PrivacyComponent} from "./privacy/privacy.component";
import {CareerComponent} from "./career/career.component";
import {TermsConditionsComponent} from "./terms_conditions/termsConditions.component";
import {JobFlatFormComponent} from "./job_flatform/job_flatform.component";


const routes: Routes = [
  {
        path: '',
        component: AboutComponent,
        children: [
          {
            path: 'aboutUs',
            component: AboutUsComponent,
          },
          {
            path: 'ourStory',
            component: OurStoryComponent,
          },
          {
            path: 'jobs',
            component: JobsComponent,
          },
          {
            path: 'media',
            component: MediaReportComponent,
          },
          {
            path: 'industry_feed',
            component: IndustryFeedComponent,
          },
          {
            path: 'contact',
            component: ContactComponent,
          },
          {
            path: 'privacy',
            component: PrivacyComponent,
          },
          {
            path: 'career',
            component: CareerComponent,
          },
          {
            path: 'terms_conditions',
            component: TermsConditionsComponent,
          },
          {
            path: 'job_flatform',
            component: JobFlatFormComponent,
          }
        ]
      }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class AboutRoutingModule {

}
