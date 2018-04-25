import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {
  constructor() {
  }

  transform(name: string, hasType: boolean): string {
    if (name.length > 10) {
      if (hasType) {
        return name.slice(0, 6) + '...' + name.slice(name.lastIndexOf('.') + 1);
      }
      return name.slice(0, 9) + '...';
    } else {
      return name;
    }
  }
}
