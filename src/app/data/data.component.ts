import { Component, OnInit } from '@angular/core';
import { SolidAccessService, SolidAuthService, SolidDataService, SolidICDDService } from 'projects/solid-auth/src/public-api';
import { urlJoin } from 'url-join-ts';
import { DataService } from './data.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {

  public rootURI: string = "http://localhost:3000/test/";

  public publicFolderExists: boolean = false;
  public privateFolderExists: boolean = false;

  public icddName: string = "test-project";

  public files: File[] = [];

  constructor(
    private _s: DataService,
    private _auth: SolidAuthService,
    private _ds: SolidDataService,
    private _as: SolidAccessService,
    private _icdd: SolidICDDService
  ) { }

  async ngOnInit() {

    // Subscribe to login status
    this._auth.getIsLoggedIn().subscribe(state => {
      console.log(state);
    }, err => console.log(err));

    // Check if folders exist
    try{
      this.publicFolderExists = await this._ds.resourceExists(this.rootURI + "public/");
      this.privateFolderExists = await this._ds.resourceExists(this.rootURI + "private/");
    }catch(err){
      console.log(err);
    }

  }

  public async addPublicContainer(){
    const url = this.rootURI + "public/";
    try{
      await this._ds.createContainer(url, true);
      this.publicFolderExists = true;
    }catch(err){
      console.log(err);
    }
  }

  public async deletePublicContainer(){
    const url = this.rootURI + "public/";
    try{
      await this._ds.deleteContainer(url);
      this.publicFolderExists = false;
    }catch(err){
      console.log(err);
    }
  }

  public async addPrivateContainer(){
    const url = this.rootURI + "private/";
    try{
      await this._ds.createContainer(url);
      this.privateFolderExists = true;
    }catch(err){
      console.log(err);
    }
  }

  public async deletePrivateContainer(){
    const url = this.rootURI + "private/";
    try{
      await this._ds.deleteContainer(url);
      this.privateFolderExists = false;
    }catch(err){
      console.log(err);
    }
  }

  public async initICDD(){
    const rootURL = urlJoin(this.rootURI, "public/");
    try{
      // Create folder inside public folder
      const makePublic = true;
      await this._icdd.initICDD(rootURL, this.icddName, makePublic);
    }catch(err){
      console.log(err);
    }
    
  }

  public onSelect(event: any){
    this.files.push(...event.addedFiles);
  }

  public onRemove(event: any){
    this.files.splice(this.files.indexOf(event), 1);
  }

  public async uploadPayloadFiles(){
    let promises = [];
    this.files.forEach(file => {

      console.log(file);

      const targetFileURL = urlJoin(this.rootURI, "public", this.icddName, "payload_documents", file.name);
      console.log(targetFileURL);

      promises.push(this._ds.writeFileToPod(file, targetFileURL, true))
    })
  }

}
