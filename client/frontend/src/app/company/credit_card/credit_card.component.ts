import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {CreditService, ICredit} from '../service/credit.service';
import {ToasterService} from 'angular2-toaster';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';
import {SeoService} from '../../../common/global/seo';
import {environment} from '../../../environments/environment';


@Component({
  templateUrl: './credit_card.component.html',
})
export class CreditCardComponent implements OnInit, AfterViewChecked {
  public companyId: string;
  public credits: ICredit[] = [];
  public loading: boolean = false;
  public addLoading: boolean;

  constructor(private creditService: CreditService,
              private toasterService: ToasterService,
              private seoService: SeoService,
              private translate: TranslateService,) {

  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('enterprise.credit'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.companyId = localStorage.getItem('company');
    this.readCreditCard();
  }


  async openCheckout() {
    let handler = (<any>window).StripeCheckout.configure({
      key: environment.cardKey,
      locale: 'auto',
      token: (token: any) => {
        let data = {paymentToken: token.id};
        this.loading = true;
        this.storeCredit(data);
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
      }
    });

    handler.open({
      name: 'FreshLinker',
      description: '2 widgets',
      label: 'Update Card Details'
    });

  }


  async readCreditCard(): Promise<any> {
    try {
      this.loading = true;
      let data = await this.creditService.get({}).toPromise();
      this.credits = data.result;
      this.loading = false;

    } catch (err) {
      this.loading = false;
    }
  }


  async storeCredit(result: any): Promise<any> {
    try {
      let data = await this.creditService.store(result).toPromise();
      let index = _.findIndex(data.result, {id: data.result.id});
      if (index === -1) this.credits.push(data.result);
      this.loading = false;
    } catch (err) {

    }
  }

  async setDefaultCredit(id: string): Promise<any> {
    try {
      this.loading = true;
      let data = await this.creditService.setDefaultCredit(id).toPromise();
      _.each(this.credits, (val: ICredit) => {
        if (id === val.id) {
          val.default_source = true;
        } else {
          val.default_source = false;
        }
      });
      this.loading = false;
      this.toasterService.pop('success', '', this.translate.instant('message.credit_card_set_default'));
    } catch (err) {

    }

  }

  async destory(id: string): Promise<any> {
    this.loading = true;
    let index = _.findIndex(this.credits, {id: id});
    try {
      await this.creditService.destroy(id).toPromise();
      this.credits.splice(index, 1);
      this.readCreditCard();
      this.toasterService.pop('success', '', this.translate.instant('message.credit_card_delete_success'));
    } catch (err) {
    }
  }


}
