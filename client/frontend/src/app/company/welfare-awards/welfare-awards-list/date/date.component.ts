import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

declare var laydate;

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
})

export class DateComponent implements OnInit{

  @ViewChild('myDate')  _date: ElementRef;
  @Input() date: string;

  @Output() change: EventEmitter<number> = new EventEmitter<number>();
  constructor() {
  }

  ngOnInit():void{
    laydate.render({
      elem:  this._date.nativeElement
      ,type: 'month'
      ,btns: ['confirm']
      ,theme: '#4a80bc'
      ,lang: 'en'
      ,change: (value)=>{
        this.change.emit(value);
      }
    });
  }

}
