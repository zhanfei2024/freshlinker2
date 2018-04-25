import {Component, ViewChild, ElementRef, OnInit, OnDestroy} from '@angular/core';
import {ChatService} from './chat.service';
import {Auth} from '../../app/auth/auth.service';
import {Router} from '@angular/router';
import {UserService, IUser} from '../../app/user/user.service';
import * as _ from 'lodash';
import {ICompany} from '../../app/company/service/company.service';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'app-root',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [UserService]
})
export class ChatComponent implements OnInit,OnDestroy{
  public content: string;
  public companyId: string;
  public userId: string;
  public open: boolean;
  public show: boolean;
  public userChat: any;
  public chatUserContent: any;
  public chatCompany: any;
  public message: string;
  public user: IUser;
  public company: ICompany;
  public num: number = 0;
  public index: number;
  public userInterlocutor: number;
  public companyInterlocutor: number;
  public isUserNews: boolean = false;
  public chatLoading: boolean = false;
  connection;
  @ViewChild('chatlist') chatlist: ElementRef;

  constructor(public chatService: ChatService,
              private router: Router,
              private userService: UserService,
              private auth: Auth) {
  }


  ngOnInit() {
    if (this.auth.isAuthenticated() && localStorage.getItem('role') === 'user') {
      this.readUser();
      this.getPrivateMessage();
    }

    this.chatService.getShow().subscribe((show) => {
      this.show = show;
      this.getChat();
    })

  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  //删除聊天用户
  async deletedList(id: number):Promise<any>  {
    try{
      await this.userService.deleteChat(id).toPromise();
      this.userChat.splice(this.userChat.findIndex(value => value.another.company.id == id), 1);
    }catch (err){
    }
  }

  //点击用户聊天
  async clickUserChat(companyId: string, index?: number): Promise<any> {
    this.open = true;
    this.isUserNews = false;
    this.chatLoading = true;
    try {
      this.companyId = companyId;
      this.index = index;
      this.chatCompany = this.userChat[this.index].another.company;
      let data = await this.getChatCompanyContent(companyId);
      this.updateUserContent();
      this.chatUserContent = _.sortBy(data.result.rows, ['id', 'id']);
      this.num = 0;
      this.userChat[this.index]['isUserNews'] = false;
      this.userChat[this.index]['readNum'] = 0;
      this.chatLoading = false;
      this.scrol();
    } catch (err) {
    }
  }

  async getChatCompanyContent(companyId:string): Promise<any>{
    try {
      let data = await this.userService.getChatCompanyContent(companyId).toPromise();
       return Promise.resolve(data);
    }catch (err){}
  }

  //更新内容
  async updateUserContent(): Promise<any> {
    try {
      await this.userService.updateContent(this.companyId).toPromise();
    } catch (err) {

    }
  }

  //获取登录用户
  async readUser() {
    try {
      this.user = await this.userService.find({}).toPromise();
      this.userInterlocutor = this.user['userInterlocutor'].id;
      this.chatService.login({'userId': this.user.id});
      await this.chatService.getLoginMessage();
    } catch (err) {
    }
  }

  //取消窗口
  close(type: string) {
    switch (type) {
      case 'back':
        this.open = false;
        this.chatCompany = undefined;
        break;
      case 'close':
        this.show = false;
        break;
    }
  }

  //显示窗口
  showChat() {
    if (this.auth.isAuthenticated()) {
      this.show = !this.show;
    } else {
      this.router.navigate(['auth', 'login']);
    }
  }

  //发送消息
  async sendUserMsg() {
    if (this.auth.isAuthenticated()) {
      this.chatService.sendMessage({
        'senderId': this.userInterlocutor,
        'companyId': this.companyId,
        'message': this.content
      });
      this.getUserMessage(this.content);
    } else {
      this.router.navigate(['auth', 'login']);
    }
  }

  //回车发送
  async enterEvent() {
    await this.sendUserMsg();
  }

  //存入数据库
  async getUserMessage(data: any): Promise<any> {
    try {
        this.userService.sendContent(this.companyId, {'message': data}).toPromise();
      this.content = '';
    } catch (err) {

    }
  }

 //获取聊天用户列表
  async getChat(): Promise<any> {
    try {
      let data = await this.userService.getChatContent({}).toPromise();
      this.userChat = data.result;
      _.each(this.userChat, async(value: any)=>{
        let readNum = 0;
        let result = await this.getChatCompanyContent(value.another.companyId);
        _.forEach(result.result.rows,(val:any)=>{
          if(val['senderId'] !== this.userInterlocutor && val.isRead === false  && value.anotherId === val['senderId']){
            value['message'] = val;
            readNum++;
          }
        });
        value['readNum'] = readNum;
        if(value['readNum'] !== 0){
          this.num += value['readNum'];
          value['isUserNews'] = true;
          this.isUserNews = true;
        }
      });
    } catch (err) {
    }
  }

  //获取及时消息push聊天内容
  public getPrivateMessage() {
    this.getChat();
    this.connection =  this.chatService.getMessage2().subscribe(receivePrivateMessage => {
      let item = _.findIndex(this.userChat, {anotherId: receivePrivateMessage['senderId']});
      if(item === -1){
        this.getChat();
      }
      if (receivePrivateMessage['receiverId'] === this.userInterlocutor) {
        this.num = this.num + 1;
        this.isUserNews = true;
      }
      if (!_.isUndefined(this.chatUserContent)) {
        this.chatUserContent.push(receivePrivateMessage);
        this.getNews(this.userChat, receivePrivateMessage);
        this.scrol();
      } else {
        this.getNews(this.userChat, receivePrivateMessage);
      }
    });
  }

  //获取新消息
  getNews(data: any, Message: any) {
    _.each(data, (value: any) => {
      if (value.another.id === Message['senderId']) {
        value['readNum'] =  value['readNum'] +1;
        value['isUserNews'] = true;
        value['message'] = Message;
      }
    });
  }

  //聊天消息滚动
  scrol() {
    setTimeout(() => {
      this.chatlist.nativeElement.scrollTop = this.chatlist.nativeElement.scrollHeight;
    }, 50);
  }

}
