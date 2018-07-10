import * as auth0 from 'auth0-js';
import { API } from '../constants/authentication';

export default class Auth {

  private auth0: any;

  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: API.domain,
      clientID: API.clientID,
      redirectUri: 'http://localhost:8080/callback',
      audience: 'https://axolot.auth0.com/userinfo',
      responseType: 'token id_token',
      scope: 'openid'
    });
  }

  public login ( username: string, password: string, cb: any): void {
    console.log('attempting to log in with username: ' + username + ' and password: ' + password);
    this.auth0.client.login({
      connection: 'email',
      username: username,
      password: password,
      realm: 'Username-Password-Authentication',
      grant_type: 'password'
    }, function (err: any, res: any) {
      console.log(err);
      console.log(res);
      if(res === undefined) {
        cb({success: false, statusCode: err.statusCode});
      } else {
        cb({success: true, auth: res});
      }
    });
  }

}