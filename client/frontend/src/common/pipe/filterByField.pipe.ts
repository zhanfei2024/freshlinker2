import {Pipe, PipeTransform} from '@angular/core';
import * as _ from "lodash";

@Pipe({
  name: 'filterByField'
})
export class FilterByFieldPipe implements PipeTransform {
  constructor() {
  }

  transform(input: Array<any>, params: Array<any>): Array<any> {
    let output = [];
    _.forEach(input, (value) => {
      if (value[params['target']] === params['value']) {
        output.push(value);
      }
    });
    return output;
  }
}
