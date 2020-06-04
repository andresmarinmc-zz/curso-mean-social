import { Component, OnInit, DoCheck } from '@angular/core';
import { UserService } from './services/user.service'
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService]
})
export class AppComponent implements OnInit, DoCheck{
  public title: string;
  public identity;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.title = 'NGSOCIAL'
  }

  ngOnInit(){
    this.identity = this._userService.getIdentity();
  }
  
  ngDoCheck(){
    this.identity = this._userService.getIdentity();
  }
  
  logout(){
    localStorage.clear();
    this.identity = null;
    this._router.navigate(['/login']);
  }
}
