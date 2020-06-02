import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';
import { GLOBAL } from './global';

@Injectable()
export class UserService {
  public url: string;
  constructor(public _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  register(user_to_register) {
      
  }
}
