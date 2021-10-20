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
    setAgentResourceAccess,
    Access,
    getFileWithAcl
} from "@inrupt/solid-client";
import { access } from "@inrupt/solid-client";

export class AccessRights{

    public read: boolean = false;
    public append: boolean = false;
    public write: boolean = false;
    public control: boolean = false;

}

export enum ResourceType{
    FILE="file",
    DATASET="dataset",
    CONTAINER="container"
}

@Injectable({
    providedIn: 'root'
})
export class SolidAccessService {

    // Make a resource public
    public async makePublic(resourceURL: string) {
        const accessRights: AccessRights = { read: true, append: true, write: false, control: false };
        return this.setResourceAccess(resourceURL, accessRights, ResourceType.CONTAINER);
    }

    public async makeFilePublic(resourceURL: string) {
        const accessRights: AccessRights = { read: true, append: true, write: false, control: false };
        return this.setResourceAccess(resourceURL, accessRights, ResourceType.FILE);
    }

    // Make a resource private
    public async makePrivate(resourceURL: string) {
        const accessRights: AccessRights = { read: false, append: false, write: false, control: false };
        return this.setResourceAccess(resourceURL, accessRights, ResourceType.CONTAINER);
    }

    public async setResourceAccess(resourceURL: string, accessRights: AccessRights, type: ResourceType, userWebID?: string){

        return this.setResourceAccess1(resourceURL, accessRights, type, userWebID);

        // return this.setResourceAccess2(resourceURL, accessRights, userWebID);

    }

    public async setFileAccess(fileURL: string, accessRights: AccessRights, userWebID?: string){
        
        // Get file with ACL
        const fileWithAcl: any = await getFileWithAcl(fileURL, {fetch: fetch});

        // Get resource ACL
        const resourceAcl = await this.getResourceAcl(fileWithAcl);

    }

    public async setResourceAccess1(resourceURL: string, accessRights: AccessRights, type: ResourceType, userWebID?: string){

        // Get resource with ACL
        let resourceWithAcl: any
        if(type == ResourceType.DATASET || type == ResourceType.CONTAINER){
            resourceWithAcl = await getSolidDatasetWithAcl(resourceURL, {fetch: fetch});
        }

        if(type == ResourceType.FILE){
            resourceWithAcl = await getFileWithAcl(resourceURL, {fetch: fetch});
        }
        
        // Get resource ACL
        const resourceAcl = await this.getResourceAcl(resourceWithAcl);
        
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
        const newAccess = await saveAclFor(resourceWithAcl, updatedAcl, {fetch: fetch});

        this.logAccessInfo(accessRights, resourceURL);

        return newAccess;

    }

    public async setResourceAccess2(resourceURL: string, accessRights: AccessRights, userWebID?: string){

        let ar: any = {...accessRights};
        ar.controlRead = accessRights.control;
        ar.controlWrite = accessRights.control;

        let newAccess: any;

        // If no user webID provided, set the public access
        if(!userWebID || userWebID == undefined){
            newAccess = await access.setPublicAccess(
                resourceURL,    // Resource
                ar,             // Access object
                { fetch: fetch }
            )
            this.logAccessInfo(newAccess, resourceURL);
        }
        
        // If user webID provided, set the access for that particular user
        else{
            newAccess = await access.setAgentAccess(
                resourceURL,    // Resource
                userWebID,      // Agent
                accessRights,   // Access object
                { fetch: fetch }
            )
            this.logAccessInfo(newAccess, resourceURL, userWebID);
        }

        return newAccess;
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

    private logAccessInfo(access: any, resource: string, agent: string = ""){
        if (access === null) {
            console.log("Could not load access details for this Resource.");
        } else {
            if(!agent) console.log(`${agent}'s Access:: `, JSON.stringify(access));
            else console.log(`Public Access:: `, JSON.stringify(access));
            console.log("...", agent, (access.read ? 'CAN' : 'CANNOT'), "read the Resource", resource);
            console.log("...", agent, (access.append ? 'CAN' : 'CANNOT'), "add data to the Resource", resource);
            console.log("...", agent, (access.write ? 'CAN' : 'CANNOT'), "change data in the Resource", resource);

            if ('controlRead' in access){
                console.log("...", agent, (access.controlRead ? 'CAN' : 'CANNOT'), "see access to the Resource", resource);
                console.log("...", agent, (access.controlWrite ? 'CAN' : 'CANNOT'), "change access to the Resource", resource);
            }else{
                console.log("...", agent, (access.control ? 'CAN' : 'CANNOT'), "change access to the Resource", resource);
            }

        }
    }

}