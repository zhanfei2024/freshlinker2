import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'weekday'
})
export class WeekdayPipe implements PipeTransform {
  constructor() {
  }

  transform(input: string): string {
    return input + ' (' + moment(input).format('ddd') + ')';
  }
}
