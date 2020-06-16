import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Publication } from '../../models/publication';
import { GLOBAL } from '../../services/global';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';
import * as $ from 'jquery';

@Component({
    selector: 'publications',
    templateUrl: './publications.component.html',
    providers: [UserService, PublicationService]
})
export class PublicationComponent implements OnInit {
    public identity;
    public token;
    public title: string;
    public url: string;
    public page: number;
    public total: number;
    public pages: number;
    public status: string;
    public publications: Publication[];
    public itemsPerPage;
    public noMore = false;
    @Input() user: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _publicationService: PublicationService
    ) {
        this.title = 'Publicaciones';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        this.page = 1;
    }

    ngOnInit() {
        console.log('Componente de publicación cargado');
        this.getPublications(this.user, this.page);
    }

    getPublications(user, page, adding = false) {
        this._publicationService.getPublicationsUser(this.token, user, page).subscribe(
            (response) => {
                if (response.publications) {
                    this.total = response.total_items;
                    this.pages = response.pages;
                    this.itemsPerPage = response.items_per_page;

                    if (!adding) {
                        this.publications = response.publications;
                    } else {
                        var arrayA = this.publications;
                        var arrayB = response.publications;
                        this.publications = arrayA.concat(arrayB);

                        $("html, body").animate( {
                            scrollTop: $("html").prop('scrollHeight')
                        }, 500);

                    }

                } else {
                    this.status = 'error';
                }
            },
            (error) => {
                var errorMessage = <any>error;
                console.log(<any>errorMessage);
                if (errorMessage != null) {
                    this.status = 'error';
                }
            }

        );
    }

    viewMore() {
        console.log("this.publications.length: " + this.publications.length);
        console.log("this.total: " + this.total);
        
        this.page = this.page + 1;
        if (this.page == this.pages) {
            this.noMore = true;
        }

        this.getPublications(this.user, this.page, true);
    }

}
