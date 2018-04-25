import {Component, OnInit, ViewChild, AfterViewChecked} from "@angular/core";
import {IPosition, PositionService, IPositionQuestion, IQuestion} from "../../position/position.service";
import {IUser, UserService} from "../user.service";
import * as _ from "lodash";
import {FileUploader, ParsedResponseHeaders, FileItem} from "ng2-file-upload";
import {ModalDirective} from "ngx-bootstrap";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";
import {Config} from "../../../common/config/config";
import {SeoService} from "../../../common/global/seo";


@Component({
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit,AfterViewChecked {
  public user: IUser;
  public companyId: number;
  public position: IPosition;
  public loading: boolean = false;
  public descriptionShow: boolean = false;
  public appliedPositions: IPosition[] = [];
  public invitationPositonLoading: boolean = false;
  public invitationPositons: IPosition[] = [];
  public positionLoading: boolean = false;
  public questionLoading: boolean = false;
  public candidateNum: number;
  public index: number;
  public invitationId: string;
  public filesName: string;
  public currentDate: Date = new Date;
  public uploader: FileUploader;
  public isError: boolean = false;
  public saveLoading: boolean;
  public news: any;
  public post: any = {
    positionAnswer: [],
    isCheckApply: false
  };


  @ViewChild('RsumeModal') RsumeModal: ModalDirective;
  @ViewChild('childApplyModal') public childApplyModal: ModalDirective;

  constructor(private userService: UserService,
              private translate: TranslateService,
              private toasterService: ToasterService,
              private config: Config,
              private seoService: SeoService,
              private positionService: PositionService) {
  }

  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('user.profile.user_profile'), this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.readUser();
    this.readPositionInvitations();
    this.getComents();
    //init uploader
    this.uploader = new FileUploader({});
    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false;
    };
    this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      let data = JSON.parse(response);
      switch (data.code) {
        case 20001:
          this.toasterService.pop('error', 'Error', `${this.translate.instant('file.Support')}`);
          break;
        case 20002:
          this.toasterService.pop('error', 'Error', `${this.translate.instant('file.File_too_large')}`);
          break;
      }
    };
    this.uploader.onSuccessItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      let data = JSON.parse(response);
      this.user = data.result;
      this.RsumeModal.hide();
      this.toasterService.pop('success', '', this.translate.instant('message.resume_success_msg'));
    };
    this.uploader.onAfterAddingAll = (fileItems: any) => {
      this.filesName = fileItems[0]['_file'].name;
    }
  }

  fileOverBase(event) {
  }
  fileDropOver(event) {

  }

  async readPositionInvitations(): Promise<any> {
    try {
      this.invitationPositonLoading = true;
      let data = await this.positionService.getPositionInvitations({'limit': 3}).toPromise();
      if (data.result.length !== 0) {
        _.each(data.result, async(value: any) => {
          value['isExpired'] = await this.userService.checkExpired(value.position.expiredDate, this.currentDate);
          if (value.position.active && !value['isExpired']) {
            value['candidateNum'] = await this.readCandidates(value.position.id);
            this.invitationPositons.push(value);
          }
        });
      }

      this.invitationPositonLoading = false;
    } catch (err) {
      this.invitationPositonLoading = false;
    }
  }


  async readCandidates(id: number): Promise<number> {
    try {
      let data = await this.positionService.getByUserAppliedPosition({'positionId': id}).toPromise();
      return Promise.resolve(data.result.length);
    } catch (err) {
      console.error(err);
    }
  }

  async rejectPositionInvite(id: string): Promise<any> {
    try {
      let index = _.findIndex(this.invitationPositons, {id: id});
       await this.positionService.rejectPositionInvite(id).toPromise();
      if (index !== -1) this.invitationPositons[index].status = 'rejected';
    } catch (err) {
      console.error(err);
    }
  }


  async readUser() {
    try {
      this.loading = true;
      const data = await this.userService.find({}).toPromise();
      if(data['companies'].length > 0){
        localStorage.setItem('postCompanyId', data['companies'][0]['userCompanies']['companyId']);
      }
       this.user = data;
      if(this.user['userInterlocutor'] === null){
        this.chatLogin();
      }
      this.readByUserAppliedPosition(this.user.id);

      this.loading = false;
    } catch (err) {
      this.loading = false;
    }
  }

  async chatLogin():Promise<any>{
    try{
      await this.userService.getChatLogin({}).toPromise();
    }catch (err){
    }
  }

  //获取热门标签
  async readByUserAppliedPosition(id: number): Promise<any> {
    try {
      let data = await this.positionService.getByUserAppliedPosition({'limit': 3, 'userId': id}).toPromise();
      if (data.result.length > 0) {
        _.each(data.result, async(value:any) => {
          value['isExpired'] = this.userService.checkExpired(value.position.expiredDate, this.currentDate);
          if (value.position.active && !value['isExpired']) {
            value['candidateNum'] = 0;
            let index = _.findIndex(this.appliedPositions, {positionId: value.positionId});
            if (value.position.active) {
              switch (value.candidateStatus.name) {
                case 'unprocessed':
                  value.candidateStatus.name = 'position.unprocessed';
                  break;
                case 'shortlist':
                  value.candidateStatus.name = 'position.shortlist';
                  break;
                case 'not-suitable':
                  value.candidateStatus.name = 'position.not-suitable';
                  break;
                case 'complete':
                  value.candidateStatus.name = 'position.complete';
                  break;
                case 'success':
                  value.candidateStatus.name = 'position.success';
                  break;
              }

              value['candidateNum'] = await this.readCandidates(value.positionId);

              if (index === -1) {
                this.appliedPositions.push(value);
              }
              this.positionLoading = false;
            }
          } else {
            this.positionLoading = false;
          }

        });
      }
    } catch (err) {
      this.positionLoading = false;
    }
  }

  // save
  async save() {
    this.saveLoading = true;
    this.uploader.setOptions({
      url: `${this.config.apiEndPoint}user/users/self/files`,
      authToken: `Bearer ${localStorage.getItem('id_token')}`
    });
    this.saveLoading = false;
    this.uploader.uploadAll();
    // this.toasterService.pop('success', '', this.translate.instant('message.resume_success_msg'));
  }

  setCandidate(id: string, invitationId: string) {
    this.childApplyModal.show();
    this.invitationId = invitationId;
    this.index = _.findIndex(this.invitationPositons, {id: invitationId});
    this.reloadFinPosition(id);
  }


  async reloadFinPosition(id: string): Promise<any> {
    try {
      let data = await this.positionService.find(id).toPromise();
      this.position = data;
      this.checkApplied();
    } catch (err) {
    }
  }

  // apply position
  checkApplied(): void {
    this.reloadPositionQuestion();
  }


  async reloadPositionQuestion(): Promise<any> {
    this.questionLoading = true;
    try {
      let data = await this.positionService.getQuestion(this.position.id).toPromise();
      this.position.positionQuestion = data;
      _.forEach(this.position.positionQuestion, (value: IPositionQuestion) => {
        if (_.isNaN(this.position.answerNum) || _.isUndefined(this.position.answerNum)) this.position.answerNum = 0;
        if (value.isRequired) {
          this.position.answerNum++;
        }
      });
      this.questionLoading = false;
    } catch (err) {
      this.questionLoading = false;
    }
  }

  checkApply() {
    if (_.isUndefined(this.position.positionQuestion)) this.position.positionQuestion = [];
    if (_.isUndefined(this.position.positionAnswer)) this.position.positionAnswer = [];
    if (this.position.positionQuestion.length > 0) {
      if (_.isNaN(this.position.pastNum) || _.isUndefined(this.position.pastNum)) this.position.pastNum = 0;
      _.forEach(this.position.positionQuestion, (value: IPositionQuestion) => {
        if (value.isRequired && !_.isUndefined(value.answer)) {
          this.position.pastNum++;
        }
        if (!_.isUndefined(value.answer)) this.post.positionAnswer.push({
          'answer': value.answer,
          'questionId': value.id,
        });
      });
      if (this.position.answerNum === this.position.pastNum) this.reloadPositionAnswer(this.post.positionAnswer);
    } else {
      this.reloadPositionAnswer();
    }

  }

  async reloadPositionAnswer(answers?: IQuestion[]): Promise<any> {
    try {
      let data = await this.positionService.userApplyPosition(this.invitationId,this.position.id, answers).toPromise();
      if (this.index !== -1) this.invitationPositons[this.index].status = 'accepted';
      this.childApplyModal.hide();
      this.toasterService.pop('success', '', this.translate.instant('message.posted_success_msg'));
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('message.posted_error_msg'));
    }
  }

  /*筛选评论消息*/
  public itemsFilter(value: any): any {
    let newsItem = [];
    value.forEach((value) => {
      if (value.objectType == 'Post' && value.isRead) {
        newsItem.push(value)
      }
    });
    return newsItem;
  }
  /*获取评论*/
  async getComents(): Promise<void>{
    const data =await this.userService.getComment().toPromise();
    this.news = this.itemsFilter(data.result);
  }

}
