import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";


@Injectable()
export class ImgFileUploaderService {
  public formData: any;


  constructor(private toasterService: ToasterService,
              private translate: TranslateService) {

  }

  dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
  }

  makeFileRequest(url: string, params: Array<string>, files: Array<File>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.formData = new FormData();
      let xhr = new XMLHttpRequest();
      this.formData.append('file', files[0], 'imageFilename.png');
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
            this.toasterService.pop('success', '', this.translate.instant('message.company_image_edit_message'));
          } else {
            reject(xhr.response);
            this.toasterService.pop('error', 'Error', `file upload failed error`);

          }
        }
      };
      xhr.open("POST", url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('id_token')}`);
      xhr.send(this.formData);
    });
  }

}
