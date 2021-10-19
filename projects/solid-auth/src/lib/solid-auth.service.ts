import { Inject, Injectable } from '@angular/core';

// Import from "@inrupt/solid-client-authn-browser"
import {
  login,
  logout,
  handleIncomingRedirect,
  getDefaultSession,
  fetch,
  Session
} from "@inrupt/solid-client-authn-browser";

// Import from "@inrupt/solid-client"
import {
  getSolidDataset,
  getThing,
  getStringNoLocale,
  getUrlAll,
  getFile
} from "@inrupt/solid-client";

import { VCARD, FOAF } from "@inrupt/vocab-common-rdf";
import { solid } from 'rdf-namespaces';
import { BehaviorSubject, Observable } from 'rxjs';
import { Config, CONFIG } from './auth-config';

export interface Profile{
  profile: any,
  fn: string|null,
  photo: string|null,
  role: string|null
}

export interface TypeIndex{
  privateIndex: string,
  publicIndex: string
}

export enum IdentityProvider{
  InruptCom="https://broker.pod.inrupt.com",
  InruptNet="https://inrupt.net/"
}

@Injectable({
  providedIn: 'root'
})
export class SolidAuthService {

  private isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private profileSubject: BehaviorSubject<Profile|undefined> = new BehaviorSubject<Profile|undefined>(undefined);
  private typeIndexesSubject: BehaviorSubject<TypeIndex|undefined> = new BehaviorSubject<TypeIndex|undefined>(undefined);

  public session?: Session;

  constructor(
    @Inject(CONFIG) private config: Config
  ){

    if(!this.config.appName) this.config.appName = "Test app";

    // Call handleRedirectAfterLogin() as we might be returning after a login redirect
    this.handleRedirectAfterLogin();

  }

  public getIsLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  public getProfile(): Observable<Profile|undefined> {
    return this.profileSubject.asObservable();
  }

  public getTypeIndexes(): Observable<TypeIndex|undefined> {
    return this.typeIndexesSubject.asObservable();
  }

  public login(identityProvider: IdentityProvider|string = IdentityProvider.InruptCom) {
    return login({
      oidcIssuer: identityProvider,
      redirectUrl: window.location.href,
      clientName: this.config.appName
    });
  }

  public async logout(){
    await logout();
    this.setIsLoggedIn(false);
    this.setProfile(undefined);
  }

  private async handleRedirectAfterLogin() {

    // Handle incoming redirect
    try{
      await handleIncomingRedirect({restorePreviousSession: true});
    }catch(err){
      console.log(err);
    }
    
    this.session = getDefaultSession();
    console.log(this.session);

    this.setIsLoggedIn(this.session.info.isLoggedIn);
    await this.readProfile();
  }

  private setIsLoggedIn(state: boolean): void {
    return this.isLoggedInSubject.next(state);
  }

  private setProfile(state: Profile|undefined): void {
    return this.profileSubject.next(state);
  }

  private setTypeIndexes(state: TypeIndex): void {
    return this.typeIndexesSubject.next(state);
  }

  private async readProfile() {
    const webID = this.session?.info?.webId;

    if(!webID || webID == undefined){
      console.log("WebID could not be retrieved");
      return;
    }
  
    // The example assumes the WebID has the URI <profileDocumentURI>#<fragment> where
    // <profileDocumentURI> is the URI of the SolidDataset
    // that contains profile data.
    
    // Parse ProfileDocument URI from the `webID` value.
    const profileDocumentURI = webID.split('#')[0];
  
    // Use `getSolidDataset` to get the Profile document.
    // Profile document is public and can be read w/o authentication; i.e.: 
    // - You can either omit `fetch` or 
    // - You can pass in `fetch` with or without logging in first. 
    //   If logged in, the `fetch` is authenticated.
    // For illustrative purposes, the `fetch` is passed in.
    const myDataset = await getSolidDataset(profileDocumentURI, { fetch: fetch });
  
    // Get the Profile data from the retrieved SolidDataset
    const profile: any = getThing(myDataset, webID);
  
    // Get the formatted name using `FOAF.name` convenience object.
    // `FOAF.name` includes the identifier string "http://xmlns.com/foaf/0.1/name".
    // As an alternative, you can pass in the "http://xmlns.com/foaf/0.1/name" string instead of `FOAF.name`.
   
    const fn = getStringNoLocale(profile, FOAF.name);
  
    // Get the role using `VCARD.role` convenience object.
    // `VCARD.role` includes the identifier string "http://www.w3.org/2006/vcard/ns#role"
    // As an alternative, you can pass in the "http://www.w3.org/2006/vcard/ns#role" string instead of `VCARD.role`.
  
    const role = getStringNoLocale(profile, VCARD.role);

    const photo = getUrlAll(profile, VCARD.hasPhoto)[0];
  
    // Set profile
    this.setProfile({fn, profile, role, photo});

    // Set public/private type index
    const publicIndex = getUrlAll(profile, solid.publicTypeIndex)[0];
    const privateIndex = getUrlAll(profile, solid.privateTypeIndex)[0];
    
    this.setTypeIndexes({privateIndex, publicIndex});
  }

}
