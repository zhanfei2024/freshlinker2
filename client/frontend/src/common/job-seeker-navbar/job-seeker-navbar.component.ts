import {Component, OnInit} from '@angular/core';
import {Auth} from "../../app/auth/auth.service";
import {ToasterService} from "angular2-toaster";
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import * as _ from "lodash";
import {UserService} from "../../app/user/user.service";
import {ChatService} from "../chat/chat.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './job-seeker-navbar.component.html',
  providers: [UserService]
})
export class JobSeekerNavbarComponent implements OnInit {
  public isCollapsed: boolean;
  public currentLang: string;
  public isUserLogin: boolean = false;
  public isEnterpriseLogin: boolean = false;
  public isRead: boolean = false;
  public news: any[]=[];
  constructor(private userService: UserService,
              private router: Router,
              private auth: Auth,
              private toasterService: ToasterService,
              private chatSevice: ChatService,
              private translate: TranslateService) {}

  public disabled: boolean = false;
  public status: { isopen: boolean } = {isopen: false};

  ngOnInit(): void {
    this.currentLang = this.translate.instant('lang.language');
    if (localStorage.getItem('role') === 'user' && this.auth.isAuthenticated()) {
      this.isUserLogin = true;
      this.getRead();
    }
    if (localStorage.getItem('role') === 'enterprise' && this.auth.isAuthenticated()) {this.isEnterpriseLogin = true;}
    this.chatSevice.getIsRead().subscribe((isRead)=>{
      this.isRead = isRead;
      if(!this.isRead){
        this.news = [];
      }
    });
  }

  public setLang(lang: string): void {
    switch (lang) {
      case 'zh-cn':
        this.translate.use('cn');
        localStorage.setItem('lang', 'cn');
        this.currentLang = this.translate.instant('lang.zh-cn');
        break;
      case 'en-us':
        this.translate.use('en');
        localStorage.setItem('lang', 'en');
        this.currentLang = this.translate.instant('lang.en-us');
        break;
      case 'zh-hk':
        this.translate.use('hk');
        localStorage.setItem('lang', 'hk');
        this.currentLang = this.translate.instant('lang.zh-hk');
        break;
    }
  }


  public logout(): void {
    this.auth.logout();
    this.isUserLogin = false;
    this.toasterService.pop('success', 'Success', 'Logout!!');
    this.router.navigate(['/']);
    localStorage.removeItem('loginRequest');
    localStorage.removeItem('changeTabId');
    localStorage.removeItem('postCompanyId');
  }


  //获取未读消息
  async getRead(): Promise<void> {
    let data = await this.userService.getRead({limit:3}).toPromise();
    _.each(data.result, (value: any) => {
      if (value.isRead === false) {
        this.news.push(value);
        this.isRead = true;
      }else{
        this.isRead = false;
      }
    });
    localStorage.setItem('isRead',_.toString(this.isRead));
    this.chatSevice.isRead(this.isRead);
  }


 //忽略消息
  async ignore(id: number): Promise<any>{
    try {
       await this.userService.ignore(id).toPromise();
      let index = _.findIndex(this.news, {id: id});
      if (index !== -1) {
        this.news.splice(index, 1);
        if(this.news.length === 0){
          this.isRead = false;
          localStorage.setItem('isRead',_.toString(this.isRead));
          this.chatSevice.isRead(this.isRead);
        }
      }
    }catch (err){}
  }

  async update(id: number): Promise<any>{
    try {
       await this.userService.updateMsg(id).toPromise();
      this.news = [];
      this.isRead = false;
      localStorage.setItem('isRead',_.toString(this.isRead));
      this.chatSevice.isRead(this.isRead);
    }catch (err){}
  }







}
