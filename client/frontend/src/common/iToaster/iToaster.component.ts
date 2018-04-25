import {Component} from "@angular/core";
import {ToasterConfig} from "angular2-toaster";

@Component({
  selector: 'iToaster',
  template: `<toaster-container [toasterconfig]="toasterConfig"></toaster-container>`
})

export class IToasterComponent {
  public toasterConfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 3000
  });
}
