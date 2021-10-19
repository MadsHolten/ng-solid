import { Injectable } from '@angular/core';
import { SolidAccessService, SolidDataService, SolidICDDService } from 'projects/solid-auth/src/public-api';
import { urlJoin } from 'url-join-ts';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private _icdd: SolidICDDService
  ){}

  public async loadData(rootURL: string){

    // Create folder inside public folder
    const icddName = "test-project";

    const makePublic = true;
    return this._icdd.initICDD(rootURL, icddName, makePublic);

  }

}