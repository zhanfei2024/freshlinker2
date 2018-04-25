import {Component, ViewChild, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import * as _ from 'lodash';
import {ChatService} from '../chat.service';
import {Auth} from '../../../app/auth/auth.service';
import {CompanyService, ICompany} from "../../../app/company/service/company.service";

@Component({
  selector: 'company-root',
  templateUrl: './companyChat.component.html',
  styleUrls: ['../chat.component.css'],
  providers: [CompanyService]
})
export class CompanyChatComponent implements OnInit,OnDestroy{
  public content: string;
  public companyId: string;
  public userId: string;
  public open: boolean;
  public show: boolean;
  public chat: any;
  public chatContent: any;
  public chatCompany: any;
  public company: ICompany;
  public num: number = 0;
  public index: number;
  public userInterlocutor: number;
  public isUserNews: boolean = false;
  public isCompanyNews: boolean = false;
  public chatLoading: boolean = false;
  connection;
  @ViewChild('chatlist') chatlist: ElementRef;

  constructor(private chatService: ChatService,
              private router: Router,
              private companyService: CompanyService,
              private auth: Auth) {
  }

  ngOnInit() {
    this.companyId = localStorage.getItem('company');
    if (this.auth.isAuthenticated() && localStorage.getItem('role') === 'enterprise') {
      this.readUser();
      this.getPrivateMessage();
    }
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  //显示窗口
  showChat() {
    if (this.auth.isAuthenticated()) {
      this.show = !this.show;

    } else {
      this.router.navigate(['enterprise', 'login']);
    }
  }

  //删除聊天用户
  async deletedList(userId:number):Promise<any>  {
    try{
      await this.companyService.deleteChat(this.companyId,userId).toPromise();
      this.chat.splice(this.chat.findIndex(value => value.another.user.id == userId), 1);
    }catch (err){
    }
  }

  //点击用户聊天
  async clickChat(userId: string, index?: number): Promise<any> {
    this.open = true;
    this.isCompanyNews = false;
    try {
      this.chatLoading = true;
      this.userId = userId;
      this.index = index;
      this.chatCompany = this.chat[this.index].another.user;
      let data = await this.getChatCompanyContent(userId);
      this.updateContent();
      this.chatContent = _.sortBy(data.result.rows, ['id', 'id']);
      this.num = 0;
      this.chat[this.index]['isUserNews'] = false;
      this.chat[this.index]['readNum'] = 0;
      this.chatLoading = false;
      this.scrol();
    } catch (err) {
    }
  }

  async getChatCompanyContent(userId:string): Promise<any>{
    try {
      let data = await this.companyService.getChatUserContent(this.companyId,userId).toPromise();
      return Promise.resolve(data);
    }catch (err){}
  }

  //更新内容
  async updateContent(): Promise<any> {
    try {
      await this.companyService.updateContent(this.companyId, this.userId).toPromise();
    } catch (err) {

    }
  }

  //获取登录用户
  async readUser() {
    try {
      this.company = await this.companyService.getCompany(this.companyId).toPromise();
      this.userInterlocutor = this.company['companyInterlocutor'].id;
      this.chatService.login({'companyId': this.company.id});
      // await this.chatService.getLoginMessage();
    } catch (err) {
    }
  }

  //取消窗口
  close(type: string) {
    switch (type) {
      case 'back':
        this.open = false;
        break;
      case 'close':
        this.show = false;
        break;
    }
  }

  //回车发送
  async enterEvent() {
    await this.sendMsg();
  }

  //发送消息
  async sendMsg() {
    if (this.auth.isAuthenticated()) {
      this.chatService.sendMessage({'senderId': this.userInterlocutor, 'userId': this.userId, 'message': this.content});
      this.sendMessage(this.content);
    } else {
      this.router.navigate(['auth', 'login']);
    }
  }

  //存入数据库
  async sendMessage(data: any): Promise<any> {
    try {
        this.companyService.sendContent(this.companyId, this.userId, {'message': data}).toPromise();
      this.content = '';
    } catch (err) {

    }
  }

  //获取用户列表
  async getCompanyChat(): Promise<any> {
    try {
      let data = await this.companyService.getChatContent(this.companyId).toPromise();
      this.chat = data.result;
      _.each(this.chat, async(value: any)=>{
        let readNum = 0;
        let result = await this.getChatCompanyContent(value.another.userId);
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
          this.isCompanyNews = true;
        }
      });
    } catch (err) {
    }
  }


  //获取及时消息push聊天内容
  public getPrivateMessage() {
    this.getCompanyChat();
    this.connection = this.chatService.getMessage2().subscribe(receivePrivateMessage => {
      let item = _.findIndex(this.chat, {anotherId: receivePrivateMessage['senderId']});
      if(item === -1){
        this.getCompanyChat();
      }
      if (receivePrivateMessage['receiverId'] === this.userInterlocutor) {
        this.num = this.num + 1;
        this.isCompanyNews = true;
      }
      if (!_.isUndefined(this.chatContent)) {
        this.chatContent.push(receivePrivateMessage);
        this.getNews(this.chat, receivePrivateMessage);
        this.scrol();
      } else {
        this.getNews(this.chat, receivePrivateMessage);
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
