import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  constructor() {
  }

  transform(array: any[], field: string, orderField: string): any[] {
    array.sort((a: any, b: any) => {
      if (orderField === 'desc') {
        if (a[field] < b[field]) {
          return 1;
        } else if (a[field] > b[field]) {
          return -1;
        } else {
          return 0;
        }
      } else {
        if (a[field] < b[field]) {
          return -1;
        } else if (a[field] > b[field]) {
          return 1;
        } else {
          return 0;
        }
      }

    });
    return array;
  }
}
