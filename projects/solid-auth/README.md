# SolidAuth

## Install
`npm i --save ngx-solid-auth`
`npm i --save @inrupt/solid-client @inrupt/solid-client-authn-browser @inrupt/vocab-common-rdf rdf-namespaces buffer`

Add to polyfills.ts
`(window as any).global = window;`

In app.module:

```typescript
import { SolidAuthModule, SolidAuthService } from 'ngx-solid-auth';

@NgModule({
  ...
  imports: [
    ...
    SolidAuthModule.forRoot({
      appName: "My awesome app"
    })
  ],
  providers: [SolidAuthService]
})
```

## Methods

### Login
```typescript
import { SolidAuthService, IdentityProvider } from 'ngx-solid-auth';

export class MyComponent {

    constructor(
        private: _auth: SolidAuthService
    ){}

    login(identityProvider: IdentityProvider|string){
        this._auth.login(identityProvider);
    }

}
```

### Logout
```typescript
import { SolidAuthService } from 'ngx-solid-auth';

export class MyComponent {

    constructor(
        private: _auth: SolidAuthService
    ){}

    async logout(){
        await this._auth.logout();
    }

}
```

### Subscribe to misc observables
By subscribing to any of these observables, an event is emitted each time the value changes.

```typescript
import { SolidAuthService, Profile,  } from 'ngx-solid-auth';

export class MyComponent implements OnInit {

    public isLoggedIn: boolean = false;
    public profile?: Profile;
    public typeIndexes?: TypeIndex;

    constructor(
        private: _auth: SolidAuthService
    ){}

    ngOnInit(){

        // Subscribe to login status
        this._auth.getIsLoggedIn().subscribe(state => {
            this.isLoggedIn = state;
        }, err => console.log(err));

        // Subscribe to profile
        this._auth.getProfile().subscribe(state => {
            this.profile = state;
        }, err => console.log(err));

        // Subscribe to type indexes
        this._auth.getTypeIndexes().subscribe(state => {
            this.typeIndexes = state;
        }, err => console.log(err));

    }

}
```

### Get image authorized

Use the auth pipe to return safe content such as images from SOLID

```html
<img [attr.src]="imgURL | auth | async">
```