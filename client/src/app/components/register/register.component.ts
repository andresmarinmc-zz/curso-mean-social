import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  providers: [UserService],
})
export class RegisterComponent implements OnInit {
  public title: string;
  public user: User;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.title = 'Regístrate';
    this.user = new User('', '', '', '', '', '', '', '');
  }

  ngOnInit() {
    console.log('Componente de registro cargado');
  }

  onSubmit(registerForm) {
    this._userService.register(this.user);
  }
}
