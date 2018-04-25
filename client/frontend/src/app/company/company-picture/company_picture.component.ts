import {Component, OnInit, AfterViewChecked} from '@angular/core';
import {IPictures, IPicture, CompanyService} from "../service/company.service";
import * as _ from "lodash";
import {FileUploader, ParsedResponseHeaders, FileItem} from "ng2-file-upload";
import {Config} from "../../../common/config/config";
import {ToasterService} from "angular2-toaster";
import {SeoService} from "../../../common/global/seo";
import {TranslateService} from "@ngx-translate/core";


@Component({
  templateUrl: './company_picture.component.html',
})
export class CompanyPictureComponent implements OnInit,AfterViewChecked{
  public tableLoading: boolean = false;
  public companyId: string;
  public pictureLoading: boolean = false;
  public editPicture: boolean = false;
  public pictures: IPictures[] = [];
  public loadPictures: IPicture[] = [];
  public uploader: FileUploader;


  public files: any;
  public filesName: string;
  constructor(private companyService:CompanyService,
              private toasterService: ToasterService,
              private seoService: SeoService,
              private translate: TranslateService,
              private config: Config,) {}
  ngAfterViewChecked(){
    this.seoService.setTitle(this.translate.instant('enterprise.edit_picture'),this.seoService.getTitleContent());
  }

  ngOnInit(){
    this.companyId = localStorage.getItem('company');
    this.readPicture();
    //init uploader
    this.uploader = new FileUploader({});
    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false;
    };
    this.uploader.onErrorItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      this.toasterService.pop('error', 'Error', `file ${item.file.name} upload failed`);
    };
    this.uploader.onSuccessItem = (item: FileItem, response: string, status: number, headers: ParsedResponseHeaders) => {
      let data = JSON.parse(response);
      this.pictures.push(data.result);
      this.toasterService.pop('success', 'Success', `file ${item.file.name} upload successed`);
    };
    this.uploader.onAfterAddingAll =(fileItems: any) =>{
      this.filesName = fileItems[0]['_file'].name;
    }
  }

  //加载图片
  async readPicture(): Promise<any> {
    try {
      this.pictureLoading = true;
      let data = await this.companyService.getCompanyPictures(localStorage.getItem('company')).toPromise();
      this.pictures = data;
      this.pictureLoading = false;
    } catch (err) {
      this.pictureLoading = false;
    }
  }

  //加载图片
  async deletePicture(id:string): Promise<any> {
    try {
      this.pictureLoading = true;
      let data = await this.companyService.destroyPictures(localStorage.getItem('company'),id).toPromise();
      let index = _.findIndex(this.pictures, {id: id});
      this.pictures.splice(index, 1);
      this.loadPictures.splice(index, 1);
      this.pictureLoading = false;
    } catch (err) {
      this.pictureLoading = false;
    }
  }

  uploadFiles(){
    let data = this.uploader.setOptions({
      url: `${this.config.apiEndPoint}enterprise/companies/${localStorage.getItem('company')}/pictures`,
      autoUpload: true,
      authToken: `Bearer ${localStorage.getItem('id_token')}`,
    });
    this.uploader.uploadAll();
  }


}
