import {Component, OnInit, AfterViewChecked, TemplateRef, ViewChild, ElementRef, Input} from '@angular/core';
import {WelfareAwardsService, IAwards} from "../../service/welfare-awards.service";
import {ToasterService} from "angular2-toaster";
import {TranslateService} from "@ngx-translate/core";
import * as _ from "lodash";
import {SeoService} from "../../../../common/global/seo";
import {ActivatedRoute} from "@angular/router";
import {CompanyService} from "../../service/company.service";
import {FileUploader, FileItem, ParsedResponseHeaders} from "ng2-file-upload";
import {Config} from "../../../../common/config/config";
import {BsModalRef, BsModalService} from "ngx-bootstrap";


@Component({
  templateUrl: './welfare-awards.component.html',
})
export class WelfareAwardsComponent implements OnInit,AfterViewChecked {
  public welfareTab: any[] = []
  public selectWefare: any[];
  public welfare: any;
  public awards: any;
  public welfareIndex: number;
  public search: string;
  public companyId: string;
  public tableLoading: boolean = false;
  public welfareLoading: boolean = false;
  public awardsLoading: boolean = false;
  public tabLoading: boolean = false;
  public loading: boolean = false;
  public tags: any;
  public url: string;
  public title: string;
  public content: string;
  public video: any;
  public filesName: string;
  public uploader: FileUploader;
  public skillShow: boolean;
  public skillShow1: boolean;
  public skillShow3: boolean;
  public award: IAwards = {
    name: '',
    date: ''
  };
  public temptation: Array<string> =
    ['Dental insurance ', 'Double pay', 'Education allowance', 'Five-day work week'
      , 'Flexible working hours', 'Free shuttle bus', 'Gratuity', 'Housing allowance', 'Life insurance', 'Medical insurance', 'Overtime pay',
      'Performance bonus', 'Transportation allowance','Travel allowance','Work from home'];


  public modalRef: BsModalRef;
  public modalConfig = {
    animated: true,
    keyboard: true,
    backdrop: false,
    ignoreBackdropClick: true
  };



  constructor(private welfareAwardsService: WelfareAwardsService,
              private toasterService: ToasterService,
              private companyService: CompanyService,
              private route: ActivatedRoute,
              private seoService: SeoService,
              private modalService: BsModalService,
              private config: Config,
              private translate: TranslateService,) {
  }

  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('enterprise.vip'), this.seoService.getTitleContent());
  }


  ngOnInit() {
    this.companyId = localStorage.getItem('company');
    this.route.params.subscribe(
      (params) =>{
        this.changTabg(_.toNumber(params['id']));
      }
    );
    this.welfareTab = [
      {
        id: 1,
        name: 'company.company_welfare',
      },
      {
        id: 2,
        name: 'company.company_prize',
      }
    ];
    this.uploader = new FileUploader({});
    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false;
    };
    this.uploader.onAfterAddingAll =(fileItems: any) =>{
      this.filesName = fileItems[0]['_file'].name;
    };
    this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      this.toasterService.pop('error', 'Error', `message.company_create_success_icon_create_dimensions_error`);
    };
    this.uploader.onSuccessItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      let data = JSON.parse(response);
      this.toasterService.pop('success', '', this.translate.instant('message.company_image_edit_message'));
      this.modalService.hide(1);
    };
    this.readWelfare();
    this.readAwards();
    this.readVideo();
  }

  countChange(event: string) {
    this.award.date = event;
  }

  public openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.modalConfig);
  }


  changTabg(id: number) {
    this.welfareIndex = id;
    this.tabLoading = true;
    this.loading = true;

    setTimeout(() => {
      this.tabLoading = false;
    }, 1000);

  }


  public refreshValue(value: any): void {
    this.tags = this.itemsToString(value);
    if (this.tags.length === 0) {
      alert(this.translate.instant('message.company_welfare_at_least_one_item'));
    }
  }
  async save() {
    try {
       await this.welfareAwardsService.storeWelfare(localStorage.getItem('company'), {name: this.tags.toString()}).toPromise();
      this.toasterService.pop('success', '', this.translate.instant('message.company_welfare_name_success_msg'));
    } catch (err) {
    }
  }

  public itemsToString(value: Array<any> = []): any {
    return value
      .map((item: any) => {
        return item.text;
      });
  }


  async readWelfare() {
    try {
      this.welfareLoading = true;
      let data = await this.welfareAwardsService.getWelfare(localStorage.getItem('company')).toPromise();
      if(data.result.length > 0){
        this.selectWefare = data.result[data.result.length -1].name.split(',');
        this.tags = data.result[0].name.split(',');
      }else{
        this.welfare = [];
      }
      this.welfareLoading = false;
    } catch (err) {
      this.welfareLoading = false;
    }
  }


  async saveWelfare() {
    try {
      await this.welfareAwardsService.storeWelfare(localStorage.getItem('company'), {name: this.tags.toString()}).toPromise();
      this.toasterService.pop('success', '', this.translate.instant('message.company_welfare_name_success_msg'));
      this.readWelfare();
    } catch (err) {
    }
  }

  async readAwards() {
    try {
      this.awardsLoading = true;
      let data = await this.welfareAwardsService.getAwards(localStorage.getItem('company')).toPromise();
      this.awards = data.result;
      this.awardsLoading = false;
    } catch (err) {
      this.awardsLoading = false;
    }
  }

  async saveAwards() {
    if (this.award.date === '') {
      this.toasterService.pop('error', '', this.translate.instant('message.company_add_welfare_date_error_msg'));
    } if (this.award.name === '') {
      this.toasterService.pop('error', '', this.translate.instant('message.company_add_welfare_title_error_msg'))
    } else {
      try {
        let data = await this.welfareAwardsService.storeAwards(localStorage.getItem('company'), this.award).toPromise();
        this.awards.push(data);
        this.toasterService.pop('success', '', this.translate.instant('message.company_awards_name_success_msg'));
        this.award.date = '';
        this.award.name = '';
        this.skillShow3 = !this.skillShow3
      } catch (err) {
      }
    }
  }


  async readVideo(): Promise<any> {
    try {
      let data = await this.companyService.getEVideo(this.companyId).toPromise();
      this.video = data.result[0];
    } catch (err) {
    }
  }

  async uploadFiles(){
    if(!_.isUndefined(this.url)){
      try {
        await this.companyService.storeVideo(localStorage.getItem('company'), {url: this.url}).toPromise();
        this.url = '';
        this.readVideo();
        this.toasterService.pop('success', '', this.translate.instant('message.company_video_name_success_msg'));
      }catch (err){}
    }
  }


  async deleteAwards(id:string) {
    try {
      await this.welfareAwardsService.destroyAwards(localStorage.getItem('company'),id).toPromise();
      let index = _.findIndex(this.awards, {id: id});
      if (index !== -1) {
        this.awards.splice(index, 1);
      }
      this.toasterService.pop('success', '', this.translate.instant('message.company_delete_welfare_name_success_msg'));
    } catch (err) {}
  }

  async saveDynamic() {
    try {
      let data = await this.companyService.storeDynamics(localStorage.getItem('company'), {
        content: this.content
      }).toPromise();
      this.toasterService.pop('success', '', this.translate.instant('message.company_dynamic_name_success_msg'));
      this.uploader.setOptions({
        url: `${this.config.apiEndPoint}enterprise/companies/${localStorage.getItem('company')}/companyDynamics/${data.id}/pictures`,
        authToken: `Bearer ${localStorage.getItem('id_token')}`,
      });
      this.content = '';
      this.filesName = '';
      this.uploader.uploadAll();
      this.modalRef.hide();
    } catch (err) {
    }
  }

}
