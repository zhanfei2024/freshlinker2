import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthConfig} from '../../common/config/auth.config';
import {HttpService} from '../../common/http/http.service';
import {User} from '../user/user.service';

import * as auth0 from 'auth0-js';
import {TranslateService} from '@ngx-translate/core';
import {URLSearchParams} from '@angular/http';
import {ToasterService} from 'angular2-toaster';

interface IIsActivate {
  isActivated: boolean;
}

@Injectable()
export class Auth {
  auth0Item = new auth0.WebAuth({
    domain: this.authConfig.authDomain,
    clientID: this.authConfig.authClientID,
    redirectUri: this.authConfig.authCallback,
    responseType: 'token id_token',
    // audience: this.authConfig.apiEndPoint,
    scope: 'openid profile'
  });


  //Store profile object in auth class
  userProfile: any;
  refreshSubscription: any;

  constructor(private httpService: HttpService,
              private router: Router,
              private toasterService: ToasterService,
              private translate: TranslateService,
              private authConfig: AuthConfig) {
  }


  public handleAuthentication(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.auth0Item.parseHash({_idTokenVerification: false}, async (err, authResult) => {
        if (err) return reject(err);
        if (authResult && authResult.accessToken && authResult.idToken) {
          window.location.hash = '';
          this.setSession(authResult);
          let enterprise = await this.isEnterpriseActivate().toPromise();
          let user = await this.isUserActivate().toPromise();
          if (user.isActivated) {
            await this.getProfileAndActivate(authResult);
          } else if (enterprise.isActivated) {
            await this.getProfileAndEnterpriseActivate(authResult);
          }

          if (localStorage.getItem('role') === 'user') {
            this.router.navigate(['/user', 'dashboard']);
          } else if (localStorage.getItem('role') === 'enterprise') {
            this.router.navigate(['/company', 'company-edit']);
          } else {
            this.router.navigate(['/']);
          }
        }
        return resolve();
      });
    });
  }

  public getProfileAndActivate(authResult): Promise<any> {
    // Fetch profile information
    return new Promise((resolve, reject) => {
      this.auth0Item.client.userInfo(authResult.accessToken, async (err, profile) => {
        if (err) return reject(err);

        localStorage.setItem('profile', JSON.stringify(profile));
        localStorage.setItem('role', 'user');
        this.userProfile = profile;
        try {
          let enterprise = await this.isEnterpriseActivate().toPromise();
          let user = await this.isUserActivate().toPromise();
          if (!enterprise.isActivated && !user.isActivated) {
            await this.userActivate({email: this.userProfile['email']}).toPromise();
          } else if (!user.isActivated) {
            return reject('message.not_user_role_error_msg');
          }
          // this.scheduleRefresh();
          return resolve();
        } catch (err) {
          return reject(err);
        }
      });
    })
  }

  userActivate(data: any = {}): Observable<User> {
    return this.httpService
      .post('user/activate', data)
      .map(res => res.json().result)
      .map(res => new User(res));
  }

  isUserActivate(): Observable<IIsActivate> {
    return this.httpService
      .post('user/is_activated', {})
      .map(res => res.json().result)
  }

  isUserExist(data: any = {}): Observable<any> {
    let options = {
      search: new URLSearchParams(decodeURIComponent(this.httpService.objectToParams(data)))
    };
    return this.httpService
      .get('public/auth', options)
      .map(res => res.json().result)
  }

  public getProfileAndEnterpriseActivate(authResult): Promise<any> {
    // Fetch profile information
    return new Promise((resolve, reject) => {
      this.auth0Item.client.userInfo(authResult.accessToken, async (err, profile) => {
        if (err) return reject(err);

        localStorage.setItem('profile', JSON.stringify(profile));
        localStorage.setItem('role', 'enterprise');
        this.userProfile = profile;
        try {
          let enterprise = await this.isEnterpriseActivate().toPromise();
          let user = await this.isUserActivate().toPromise();
          if (!enterprise.isActivated && !user.isActivated) {
            await this.enterpriseActivate({email: this.userProfile['email']}).toPromise();
          } else if (!enterprise.isActivated) {
            return reject('message.not_company_role_error_msg');
          }
          return resolve();
        } catch (err) {
          return reject(err);
        }
      });
    })
  }


  enterpriseActivate(data: any = {}): Observable<User> {
    return this.httpService
      .post('enterprise/activate', data)
      .map(res => res.json().result)
      .map(res => new User(res));
  }

  isEnterpriseActivate(): Observable<IIsActivate> {
    return this.httpService
      .post('enterprise/is_activated')
      .map(res => res.json().result)
  }

  public signUp(username: string, password: string, isEnterprise: boolean): Observable<any> {
    return Observable.create(observer => {
      this.auth0Item.signupAndAuthorize({
        connection: 'Username-Password-Authentication',
        email: username,
        password: password,
      }, async (err, authResult) => {
        if (err) {
          this.toasterService.pop('error', 'Error', err.description);
          // observer.complete();
          // console.log(err.description)
        } else {
          this.setSession(authResult);
          if (isEnterprise) {
            await this.enterpriseActivate({email: username}).toPromise();
          } else {
            await this.userActivate({email: username}).toPromise();
          }
          await this.login(username, password, isEnterprise).toPromise();
          this.toasterService.pop('success', 'Success', this.translate.instant('message.register_success_message'));
          observer.next(authResult);
          observer.complete();
        }
      });
    })
  }

  public login(username: string, password: string, isEnterprise: boolean): Observable<any> {
    return Observable.create(observer => {
      this.auth0Item.client.login({
        realm: 'Username-Password-Authentication',
        username,
        password
      }, async (err, authResult) => {
        try {
          if (err) {
            observer.error(err);
            this.toasterService.pop('error', 'Error', this.translate.instant(err.description));
          } else {
            this.setSession(authResult);
            if (isEnterprise) {
              await this.getProfileAndEnterpriseActivate(authResult);
            } else {
              await this.getProfileAndActivate(authResult);
            }
            observer.next(authResult);
            observer.complete();
          }
        } catch (err) {
          this.toasterService.pop('error', 'Error', this.translate.instant(err));
          observer.error();
        }
      });
    });
  }

  public setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn) * 1000 + Date.now());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);

    this.scheduleRenewal();
  }


  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return Date.now() < expiresAt;
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.clear();
    // localStorage.removeItem('company');
    this.unscheduleRenewal();
    // Go back to the home route
    this.router.navigate(['/']);
  }


  public renewToken() {
    this.auth0Item.renewAuth({
      audience: this.authConfig.apiEndPoint,
      redirectUri: this.authConfig.authCallback,
      usePostMessage: true
    }, (err, result) => {
      if (err) {
        alert(`Could not get a new token using silent authentication (${err.error}).`);
      } else {
        alert(`Successfully renewed auth!`);
        this.setSession(result);
      }
    });
  }

  public scheduleRenewal() {
    if (!this.isAuthenticated()) {
      localStorage.clear();
      return;
    };
    this.unscheduleRenewal();

    const expiresAt = JSON.parse(window.localStorage.getItem('expires_at'));

    const source = Observable.of(expiresAt).flatMap(
      expiresAt => {

        const now = Date.now();

        // Use the delay in a timer to
        // run the refresh at the proper time
        return Observable.timer(Math.max(1, expiresAt - now));
      });

    // Once the delay time from above is
    // reached, get a new JWT and schedule
    // additional refreshes
    this.refreshSubscription = source.subscribe(() => {
      this.renewToken();
      this.scheduleRenewal();
    });
  }

  public unscheduleRenewal() {
    if (!this.refreshSubscription) return;
    this.refreshSubscription.unsubscribe();
  }

  public popupForgetPassword(username: string): Observable<any> {
    return Observable.create(observer => {
      this.auth0Item.changePassword({
        connection: 'Username-Password-Authentication',
        email: username
      }, function (err, resp) {
        if (err) {
          observer.error(err);
        } else {
          observer.complete();
        }
      });
    });
  }




}
