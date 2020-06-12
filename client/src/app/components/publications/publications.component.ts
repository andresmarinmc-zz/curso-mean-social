import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Publication } from '../../models/publication';
import { GLOBAL } from '../../services/global';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';

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
        this.getPublications(this.page);
    }

    getPublications(page, adding = false) {
        this._publicationService.getPublications(this.token, page).subscribe(
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
        console.log("this.publications.length: "+this.publications.length);
        console.log("this.total: "+this.total);
        if (this.publications.length == this.total) {
            this.noMore = true;
        } else {
            this.page = this.page + 1;
        }

        this.getPublications(this.page, true);
    }

}
