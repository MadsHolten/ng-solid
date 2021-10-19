import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SolidDataService } from './solid-data.service';

// The auth pipe is used to return safe content such as images from SOLID
// Example use:
// <img [attr.src]="imgURL | auth | async">

@Pipe({
    name: 'auth'
})
export class AuthPipe implements PipeTransform {

    constructor(
        private _ds: SolidDataService,
        private sanitizer: DomSanitizer) { }

    transform(url: string): Observable<SafeUrl> {

        return from(this.getFile(url)).pipe(
            map( val => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(val)) )
        );

    }

    async getFile(fileURL: string){
        return this._ds.getFile(fileURL);
    }

}