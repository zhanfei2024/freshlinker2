import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {
  constructor() {
  }

  transform(input: string, format: string): string {
    return moment(input).format(format);
  }
}
