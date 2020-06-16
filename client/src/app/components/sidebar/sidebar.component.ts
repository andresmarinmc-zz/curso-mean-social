import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GLOBAL } from '../../services/global';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UploadService } from '../../services/upload.service';

import { Publication } from '../../models/publication';

import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    providers: [UserService, PublicationService, UploadService]
})
export class SidebarComponent implements OnInit {
    public status: string;
    public identity;
    public token;
    public stats;
    public url;
    public publication: Publication;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _publicationService: PublicationService,
        private _uploadService: UploadService
    ) {
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.stats = this._userService.getStats();
        this.url = GLOBAL.url;
        this.publication = new Publication('', '', '', '', this.identity._id);
    }

    ngOnInit() {
        console.log('Componente de sidebar cargado');
    }

    onSubmit(form, event) {
        //console.log(this.publication);
        this._publicationService.addPublication(this.token, this.publication).subscribe(
            response => {
                //console.log(response.publication);
                if (response.publication) {

                    if (this.filesToUpload && this.filesToUpload.length) {
                        //Subir Imagen
                        this._uploadService.makeFileRequest(this.url + 'upload-image-pub/' + response.publication._id, [], this.filesToUpload, this.token, 'image').then(
                            (result: any) => {
                                this.publication.file = result.image;
                                this.sended.emit({ sended: 'true' });
                            }
                        );
                    }

                    this._router.navigate(['/timeline']);
                    this.status = "success";
                    form.reset();                    

                } else {
                    this.status = "error";
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);
                if (errorMessage != null) {
                    this.status = errorMessage;
                }
            }
        );

    }

    public filesToUpload: Array<File>;
    fileChangeEvent(fileInput: any) {
        this.filesToUpload = <Array<File>>fileInput.target.files;
    }

    //Ouput
    @Output() sended = new EventEmitter();
}
