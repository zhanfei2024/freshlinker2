import {NgModule} from "@angular/core";
import {IToasterComponent} from "./iToaster.component";
import {ToasterModule} from "angular2-toaster";

@NgModule({
  imports: [ToasterModule],
  declarations: [IToasterComponent],
  exports: [IToasterComponent]
})

export class IToasterModule {

}
