import { Component, OnInit } from '@angular/core';
import { IdentityProvider, Profile, SolidAuthService, SolidDataService, SolidNotificationsService, TypeIndex } from 'projects/solid-auth/src/public-api';
import 'codemirror/mode/javascript/javascript';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public isLoggedIn: boolean = false;
  public showProfile: boolean = false;
  public profile?: Profile;
  public typeIndexes?: TypeIndex;

  public useOwnIP: boolean = false; // Use own identity provider?
  public identityProvider: string = "http://localhost:3000";

  public resourceURL: string = "https://pod.inrupt.com/mads/public/Louie.svg";

  public loginOptions = [
    {title: "Inrupt.com", value: IdentityProvider.InruptCom},
    {title: "Inrupt.net", value: IdentityProvider.InruptNet}
  ]

  public fileContent: any;
  public cmConfig = {
    lineNumbers: true,
    firstLineNumber: 1,
    lineWrapping: true,
    matchBrackets: true,
    mode: 'application/json'
  };

  constructor(
    private _auth: SolidAuthService,
    private _ds: SolidDataService,
    private _ns: SolidNotificationsService
  ) { }

  ngOnInit(): void {

    // Subscribe to login status
    this._auth.getIsLoggedIn().subscribe(state => {
      this.isLoggedIn = state;
    }, err => console.log(err));

    // Subscribe to profile
    this._auth.getProfile().subscribe(state => {
      console.log(state);
      this.profile = state;
    }, err => console.log(err));

    // Subscribe to type indexes
    this._auth.getTypeIndexes().subscribe(state => {
      console.log(state);
      this.typeIndexes = state;
    }, err => console.log(err));

  }

  login(identityProvider: IdentityProvider|string){
    this._auth.login(identityProvider);
  }

  async logout(){
    await this._auth.logout();
  }

  onShowProfile(){
    this.showProfile = !this.showProfile;
  }

  public async getDataset(fileURL: string){
    const obj = await this._ds.getSolidDataset(fileURL);
    this.fileContent = JSON.stringify(obj, null, "\t");
  }

  public subscribeTo(resourceURL: string){
    console.log(resourceURL);
    this._ns.getResourceChanges(resourceURL);
  }

}
