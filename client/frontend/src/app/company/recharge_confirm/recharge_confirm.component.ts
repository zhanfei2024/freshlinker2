import {Component} from '@angular/core';


@Component({
  templateUrl: './recharge_confirm.component.html',
})
export class RechargeConfirmComponent {
  public companyId: string;

  constructor() {
    this.companyId = localStorage.getItem('company');
  }
}
