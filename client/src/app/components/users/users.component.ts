import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from '../../services/global';

import { User } from '../../models/user';
import { Follow } from '../../models/follow';

import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    providers: [UserService, FollowService]
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
    public follows;
    public users: User[];
    public status: string;
    public url: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _followService: FollowService
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
        } else {
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

            this.prev_page = (this.prev_page <= 0) ? 1 : this.prev_page;

            //Devolver listado de usuarios
            this.getUsers(page);

        });
    }

    getUsers(page) {
        this._userService.getUsers(page).subscribe(
            response => {
                console.log(response);
                if (!response.users) {
                    this.status = 'error';
                } else {
                    this.total = response.total;
                    this.users = response.users;
                    this.pages = response.pages;
                    this.follows = response.users_following;
                    console.log(this.follows);

                    if (page > this.pages) {
                        this._router.navigate(['/personas', 1]);
                    }
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);
                if (errorMessage != null) {
                    this.status = 'error';
                }
            }
        );
    }

    public followUserOver;
    mouseEnter(user_id) {
        this.followUserOver = user_id;
    }
    mouseLeave(user_id) {
        this.followUserOver = 0;
    }

    followUser(followed) {
        var follow = new Follow('', this.identity._id, followed);

        this._followService.addFollow(this.token, follow).subscribe(
            response => {
                console.log(response);
                if (!response.follow) {
                    this.status = 'error';
                } else {
                    this.status = 'success';
                    this.follows.push(followed);
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);
                if (errorMessage != null) {
                    this.status = 'error';
                }
            }
        );
    }

    unfollowUser(followed) {
        this._followService.deleteFollow(this.token, followed).subscribe(
            response => {
                console.log(response);
                var search = this.follows.indexOf(followed);
                if (search != -1) {
                    this.follows.splice(search, 1);
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);
                if (errorMessage != null) {
                    this.status = 'error';
                }
            }
        );
    }

}
