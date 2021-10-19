# NgxSolid

## Contribute

### Creating a new library
Steps for adding a library:

1. Add library `ng generate library my-lib` (or short `ng g lib my-lib`)
1. Make changes to library (in folder `projects/my-lib`)
1. Make sure that all necessary files are included in `projects/my-lib/src/public-api.ts`
1. Build demo app that uses the component to demonstrate functionality
    * Generate with `ng generate module my-lib-demo --module app --routing true --route my-lib` (or short `ng g m my-lib-demo --module app --routing true --route my-lib`)
        - Creates a new folder `app/my-lib-demo` with a new component + a module
        - Adds the route `my-lib` to `app-routing.module.ts` and points to the module of the new demo app
    * Add text (My Lib) and route (my-lib) to demos array in `app.service.ts`
    * Add the external modules you need (Material components etc.) to `app/my-lib-demo/my-lib-demo.module.ts`

### Run local Solid Community server
* `npm i -g @solid/community-server`
* `community-solid-server`
* [register new account](http://localhost:3000/idp/register/)
* Now you have a new WebId (eg. http://localhost:3000/test/profile/card#me)