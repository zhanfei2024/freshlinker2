import { Pipe, PipeTransform } from '@angular/core';


@Pipe({name: 'htmlToPlaintext'})
export class HtmlToPlaintextPipe implements PipeTransform {
    transform(text: any, value: number): string {
        text = text ? String(text).replace(/<+[^<>]+>/gm, '') : '';
        return text.substring(0,value);
    }
}
