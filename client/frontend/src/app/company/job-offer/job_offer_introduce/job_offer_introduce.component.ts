import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";


@Component({
  templateUrl: './job_offer_introduce.component.html',
})
export class JobOfferIntroduceComponent implements OnInit {
  public companyId: string;

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.route.params.subscribe(
      (params)=>{
        this.companyId = params['id'];
      }
    );
  }
}
