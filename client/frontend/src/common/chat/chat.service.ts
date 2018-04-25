import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/operator/map';
import {Subject} from 'rxjs';
import * as io from 'socket.io-client';


@Injectable()
export class ChatService {
  private url = 'http://localhost:3000';
  private socket;

  public show: boolean;
  public isCompanyNews: boolean = false;

  private subject = new Subject<boolean>();
  private read = new Subject<boolean>();

  constructor() {
  }


  showChat(isShow: boolean) {
    this.subject.next(isShow);
  }

  getShow(): Observable<any> {
    return this.subject.asObservable();
  }

  isRead(isShow: boolean) {
    this.read.next(isShow);
  }

  getIsRead(): Observable<any> {
    return this.read.asObservable();
  }

  login(data: any) {
    this.socket.emit('login', data);
  }

  update(data: any) {
    this.socket.emit('update', data);
  }

  logout(data: any) {
    this.socket.emit('disconnect', data);
  }

  sendMessage(data: any) {
    this.socket.emit('sendPrivateMessage', data);
  }



  getMessage2() {
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('receivePrivateMessage', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  getLoginMessage() {
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('login', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  // getLoginMessage() {
  //   return this.socket.fromEvent<any>('login')
  // }
  //
  // getUpdateMessage() {
  //   return this.socket.fromEvent<any>('update')
  // }
  //
  // getMessage() {
  //   return this.socket.fromEvent<any>('c').map(data => data);
  // }
  //
  // getMessage2() {
  //   return this.socket.fromEvent<any>('receivePrivateMessage').map(data => data);
  // }


}
