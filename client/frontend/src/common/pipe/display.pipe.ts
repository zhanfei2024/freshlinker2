import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'display'
})
export class DisplayPipe implements PipeTransform {
  constructor() {
  }

  transform(input: Array<any>, limit: number): Array<any> {
    return input.length >= limit ? input.splice(0, limit) : input;
  }
}
