import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from '../../services/global';

import { User } from '../../models/user';
import { Follow } from '../../models/follow';

import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    providers: [UserService, FollowService]
})
export class ProfileComponent implements OnInit {
    public title: string;
    public user: User;
    public status: string;
    public identity;
    public token;
    public stats;
    public followed;
    public following;
    public url: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _followService: FollowService
    ) {
        this.title = 'Perfil';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        //this.user = new User('', '', '', '', '', '', '', '', '');
    }

    ngOnInit() {
        console.log('Componente de profile cargado');
        this.loadPage();
    }

    loadPage() {
        this._route.params.subscribe(params => {
            let id = params['id'];
            this.getUser(id);
            this.getCounters(id);
        });
    }

    getUser(id) {
        this._userService.getUser(id).subscribe(
            response => {
                //console.log("respuesta getUser en cmpt profile: " + response.usuario_buscado.image);
                if (response.usuario_buscado) {
                    this.user = response.usuario_buscado;

                    if(response.following._id){
                        
                    }

                } else {
                    this.status = 'error';
                }
            }, error => {
                //this.status = 'error';
                console.log("error: " + <any>error);
                this._router.navigate(['/perfil', this.identity._id])
            }
        );
    }

    getCounters(id) {
        this._userService.getCounters(id).subscribe(
            response => {
                //console.log("respuesta: " + response);
                if (response) {
                    this.stats = response;
                } else {
                    this.status = 'error';
                }
            }, error => {
                this.status = 'error';
                console.log("error: " + <any>error);
            }
        );
    }
}
