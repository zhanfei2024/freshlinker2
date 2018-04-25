import {Pipe, PipeTransform} from '@angular/core';
import * as moment from "moment";

@Pipe({
  name: 'hour'
})
export class HourPipe implements PipeTransform {
  constructor() {

  }

  transform(input: string): any {
    return moment(new Date(input)).format('h');
  }
}
