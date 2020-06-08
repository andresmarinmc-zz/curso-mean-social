import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { GLOBAL } from '../../services/global';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    providers: [UserService]
})
export class UsersComponent implements OnInit {
    public title: string;
    public identity;
    public token;
    public page;
    public next_page;
    public prev_page;
    public total;
    public pages;
    public users: User[];
    public status: string;
    public url:string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ) {
        this.title = 'Personas';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
    }

    ngOnInit() {
        console.log('Componente de users cargado');
        if (!this._userService.getIdentity()) {
            this._router.navigate(['/login']);
        }else{
            this.actualPage();
        }
    }

    actualPage() {
        this._route.params.subscribe(params => {
            let page = +params['page'];
            this.page = page;

            if (!page) {
                page = 1;
            }
            
            this.next_page = page + 1;
            this.prev_page = page - 1;

            this.prev_page = ( this.prev_page <= 0 ) ? 1 : this.prev_page;
            
            //Devolver listado de usuarios
            this.getUsers(page);

        });
    }

    getUsers(page){
        this._userService.getUsers(page).subscribe(
            response => {
                console.log(response);
                if(!response.users){
                    this.status = 'error';
                }else{
                    this.total = response.total;
                    this.users = response.users;
                    this.pages = response.pages;
                    if(page > this.pages){
                        this._router.navigate(['/personas', 1]);
                    }
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);
                if(errorMessage!=null){
                    this.status = 'error';
                }
            }
        );
    }

}
