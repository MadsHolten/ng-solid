import { Injectable } from '@angular/core';

// Import from "@inrupt/solid-client-authn-browser"
import {
    fetch
} from "@inrupt/solid-client-authn-browser";

// Import from "@inrupt/solid-client"
import {
    getSolidDatasetWithAcl,
    setPublicResourceAccess,
    hasResourceAcl,
    hasAccessibleAcl,
    getResourceAcl,
    createAclFromFallbackAcl,
    hasFallbackAcl,
    saveAclFor,
    setAgentResourceAccess
} from "@inrupt/solid-client";

export class AccessRights{

    public read: boolean = false;
    public append: boolean = false;
    public write: boolean = false;
    public control: boolean = false;

}

@Injectable({
    providedIn: 'root'
})
export class SolidAccessService {

    // Make a resource public
    public async makePublic(resourceURL: string) {
        const accessRights: AccessRights = { read: true, append: true, write: false, control: false };
        return this.setResourceAccess(resourceURL, accessRights);
    }

    // Make a resource private
    public async makePrivate(resourceURL: string) {
        const accessRights: AccessRights = { read: false, append: false, write: false, control: false };
        return this.setResourceAccess(resourceURL, accessRights);
    }

    public async setResourceAccess(resourceURL: string, accessRights: AccessRights, userWebID?: string){

        // Get dataset with ACL
        const datasetWithAcl: any = await getSolidDatasetWithAcl(resourceURL, {fetch: fetch});
        console.log(datasetWithAcl);

        // Get resource ACL
        const resourceAcl = await this.getResourceAcl(datasetWithAcl);
        console.log(resourceAcl);
        
        // Update ACL access
        let updatedAcl;

        // If no user webID provided, set the public access
        if(!userWebID || userWebID == undefined){
            updatedAcl = setPublicResourceAccess(
                resourceAcl,
                accessRights,
            );
        }
        
        // If user webID provided, set the access for that particular user
        else{
            updatedAcl = setAgentResourceAccess(
                resourceAcl,
                userWebID,
                accessRights,
            );
        }

        // Save ACL
        await saveAclFor(datasetWithAcl, updatedAcl, {fetch: fetch});

    }

    // Obtain the SolidDataset's own ACL, if available,
    // or initialise a new one, if possible:
    private async getResourceAcl(datasetWithAcl: any){

        let resourceAcl;
        if (!hasResourceAcl(datasetWithAcl)) {
        if (!hasAccessibleAcl(datasetWithAcl)) {
            throw new Error(
            "The current user does not have permission to change access rights to this Resource."
            );
        }
        if (!hasFallbackAcl(datasetWithAcl)) {
            throw new Error(
            "The current user does not have permission to see who currently has access to this Resource."
            );
            // Alternatively, initialise a new empty ACL as follows,
            // but be aware that if you do not give someone Control access,
            // **nobody will ever be able to change Access permissions in the future**:
            // resourceAcl = createAcl(myDatasetWithAcl);
        }
            resourceAcl = createAclFromFallbackAcl(datasetWithAcl);
        } else {
            resourceAcl = getResourceAcl(datasetWithAcl);
        }

        return resourceAcl;
    }

}