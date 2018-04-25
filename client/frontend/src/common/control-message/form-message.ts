import {Component, Input} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'form-message',
  templateUrl: './form-message-template.html'
})
export class FormMessage {
  @Input() control: FormControl;
  @Input() fieldName: string;

  constructor() {
  }
}

