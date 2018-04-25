import {Component, ViewContainerRef, OnInit, ViewChild, AfterViewChecked} from '@angular/core';
import {IFilter, IPosition, PositionService, IMeta,IPositionQuestion,IQuestion} from "../../position/position.service";
import {UserService} from "../user.service";
import * as _ from "lodash";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";
import {ModalDirective} from "ngx-bootstrap";
import {ToasterService} from "angular2-toaster";


@Component({
  templateUrl: './job_invite.component.html',
})
export class JobInviteComponent implements OnInit,AfterViewChecked {
  public tableLoading: boolean = false;
  public position: IPosition;
  public itemsByPage: number = 10;
  public positions: any = [];
  public inviteStatus: any[] = [];
  public inviteIndex: number = 1;
  public index: number;
  public invitationId: string;
  public changeTabLoading: boolean = false;
  public positionLoading: boolean = false;
  public questionLoading: boolean = false;
  public meta: IMeta = {pagination: {}};
  public fliter: IFilter = {
    limit: 10,
    page: 1,
    status: '',
    search: '',
  };
  public isApplied: boolean = false;
  public similarPositions: IPosition[] = [];
  public loading: boolean = false;
  public currentDate: Date = new Date();
  public post: any = {
    positionAnswer: [],
    isCheckApply: false
  };

  @ViewChild('childApplyModal') public childApplyModal: ModalDirective;
  constructor(private positionService: PositionService,
              private seoService: SeoService,
              private translate: TranslateService,
              private toasterService: ToasterService,
              private userService: UserService) {

  }
  ngAfterViewChecked() {
    this.seoService.setTitle(this.translate.instant('user.profile.job_invite'),this.seoService.getTitleContent());
  }

  ngOnInit() {
    this.inviteStatus = [
      {
        id: 1,
        name: 'position.untreated_post',
        status: 'pending'
      },
      {
        id: 2,
        name: 'position.accepted_post',
        status: 'accepted'
      },
      {
        id: 3,
        name: 'position.rejected_post',
        status: 'rejected'
      }
    ];

    this.inviteTab(1);

  }

  inviteTab(id: number) {
    this.inviteIndex = id;
    this.changeTabLoading = true;
    this.positions = [];
    this.positionLoading = true;
    this.fliter.search = '';
    switch (id) {
      case 1:
        this.fliter.status = 'pending';
        break;
      case 2:
        this.fliter.status = 'accepted';
        break;
      case 3:
        this.fliter.status = 'rejected';
        break;
    }
    this.CallPositionServer();
    this.changeTabLoading = false;
  }

  searchPosition() {
    this.changeTabLoading = true;
    this.positions = [];
    this.positionLoading = true;
    this.changeTabLoading = false;
    this.CallPositionServer();
  }


  async readCandidates(id: number): Promise<number> {
    try {
      let data = await this.positionService.getByUserAppliedPosition({'positionId': id}).toPromise();
      return Promise.resolve(data.result.length);
    } catch (err) {
      console.error(err);
    }
  }

  //加载分页
  async changePage(event: any) {
    this.fliter.page = event.page;
    this.fliter.limit = event.itemsPerPage;
    await this.CallPositionServer();
  }

  //获取分页数据
  async CallPositionServer(): Promise<any> {
    try {
      this.tableLoading = true;
      this.positionLoading = true;
      let data = await this.positionService.getPositionInvitations(this.fliter.search === '' ? _.omit(this.fliter, 'search') : this.fliter).toPromise();
      this.meta = data.meta;
      if (data.result.length !== 0) {
        _.each(data.result, async(value: any) => {
          value['isExpired'] = this.userService.checkExpired(value.position.expiredDate, this.currentDate);
          if (value.position.active && !value['isExpired']) {
            value['candidateNum'] = await this.readCandidates(value.position.id);
            this.positions.push(value);
          }
        });
      }
      this.tableLoading = false;
      this.positionLoading = false;
    } catch (err) {
      this.tableLoading = false;
      this.positionLoading = false;

    }
  }

  async rejectPositionInvite(id: string): Promise<any> {
    try {
      let index = _.findIndex(this.positions, {id: id});
      let data = await this.positionService.rejectPositionInvite(id).toPromise();
      if (index !== -1) this.positions[index].status = 'rejected';
      this.inviteTab(1);
    } catch (err) {
      console.error(err);
    }
  }

  setCandidate(id: string, invitationId: string) {
    this.childApplyModal.show();
    this.invitationId = invitationId;
    this.index = _.findIndex(this.positions, {id: invitationId});
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
      if (this.index !== -1) this.positions[this.index].status = 'accepted';
      this.childApplyModal.hide();
      this.toasterService.pop('success', '', this.translate.instant('message.posted_success_msg'));
    } catch (err) {
      this.toasterService.pop('error', '', this.translate.instant('message.posted_error_msg'));
    }
  }

}
