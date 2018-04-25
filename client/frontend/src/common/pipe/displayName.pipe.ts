import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'displayName'
})
export class DisplayNamePipe implements PipeTransform {
  constructor() {
  }

  transform(name: Array<string>, format: string): string {
    if (format === 'firstname') {
      return name[0];
    } else if (format === 'lastname') {
      return name[1];
    } else if (format === 'lastname_firstname') {
      return name[1] + ' ' + name[0];
    } else {
      return name[0] + ' ' + name[1];
    }
  }
}
