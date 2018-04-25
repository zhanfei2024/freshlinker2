import {Component, OnInit} from "@angular/core";
import {ChatService} from "../../../common/chat/chat.service";
import * as _ from "lodash";


@Component({
  selector: 'app-userTabs',
  templateUrl: './user-tabs.component.html',
})

export class UserTabsComponent implements OnInit {
  public isRead: boolean = false;

  constructor(private chatSevice: ChatService) {
  }

  ngOnInit() {
    if(!_.isUndefined(localStorage.getItem('isRead')) && localStorage.getItem('isRead') === 'true'){
      this.isRead = true;
    }
    this.chatSevice.getIsRead().subscribe((isRead)=>{
      this.isRead = isRead;
    })
  }
}
