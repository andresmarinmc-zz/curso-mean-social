import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';
import { GLOBAL } from './global';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {
  public url: string;
  public identity;
  public token;
  public stats;

  constructor(public _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  register(user: User): Observable<any> {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(this.url + 'register', params, { headers: headers });
  }

  signup(user: User, getToken = null): Observable<any> {
    if (getToken != null) {
      user.gettoken = getToken;
    }

    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(this.url + 'login', params, { headers: headers });
  }

  getIdentity() {
    let identity = JSON.parse(localStorage.getItem('identity'));
    if (identity != "undefined") {
      this.identity = identity;
    } else {
      this.identity = null;
    }

    return this.identity;
  }

  getToken() {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token != "undefined") {
      this.token = token;
    } else {
      this.token = null;
    }

    return this.token;
  }

  getStats(userId = null): Observable<any> {
    let stats = JSON.parse(localStorage.getItem('stats'));

    if (stats != "undefined") {
      return this.stats = stats;
    } else {
      return this.stats = null;
    }

    return this.stats;
  }

  getCounters(userId = null): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());
    if (userId != null) {
      return this._http.get(this.url + 'counters/' + userId, { headers: headers });
    } else {
      return this._http.get(this.url + 'counters', { headers: headers });

    }
  }

  updateUser(user: User): Observable<any> {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());

    return this._http.put(this.url + 'update-user/' + user._id, params, { headers: headers });
  }

  getUsers(page = null): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());
    return this._http.get(this.url + 'users/' + page, { headers: headers });
  }
  
  getUser(id = null): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());
    return this._http.get(this.url + 'user/' + id, { headers: headers });
  }
}
