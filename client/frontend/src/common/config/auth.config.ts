import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";

@Injectable()
export class AuthConfig {
  public authDomain: string = environment.authDomain;
  public authClientID: string = environment.authClientID;
  public authCallback: string = environment.authCallback;
  public apiEndPoint: string = environment.apiEndPoint;
}
