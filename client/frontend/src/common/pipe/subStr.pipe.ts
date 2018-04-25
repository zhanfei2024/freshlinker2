import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'subStr'
})
export class subStrPipe implements PipeTransform {
  constructor() {
  }

  transform(input: string): string {
    return input.substr(0,2);
  }
}
