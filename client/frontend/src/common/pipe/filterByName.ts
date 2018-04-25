import {Pipe, PipeTransform} from '@angular/core';
import * as _ from "lodash";

@Pipe({
  name: 'filterByName'
})
export class FilterByNamePipe implements PipeTransform {
  constructor() {
  }

  transform(input: Array<any>, params: Array<any>): Array<any> {
    let output = [];
    _.forEach(input, (value) => {
      if (!_.isUndefined(value[params['target']])) {
        if (value[params['target']].indexOf(params['value']) !== -1) {
          output.push(value);
        }
      } else {
        _.forEach(value, (v, k) => {
          if (_.isPlainObject(v)) {
            if (!_.isUndefined(v[params['target']])) {
              if (v[params['target']].toUpperCase().indexOf(params['value'].toUpperCase()) !== -1) {
                output.push(value);
                return false;
              }
            }
          }
        })
      }
    });
    return output;
  }
}
