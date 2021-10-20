import { Injectable } from '@angular/core';

// Import from "@inrupt/solid-client-authn-browser"
import {
    fetch
} from "@inrupt/solid-client-authn-browser";

// Import from "@inrupt/solid-client"
import {
    getSolidDataset,
    getFile,
    createContainerAt,
    deleteFile,
    deleteContainer,
    getContainedResourceUrlAll,
    overwriteFile,
    getSourceUrl
} from "@inrupt/solid-client";
import { SolidAccessService } from './solid-access.service';

@Injectable({
    providedIn: 'root'
})
export class SolidDataService {

    constructor(
        private _as: SolidAccessService
    ){}

    /**
     * FILES
     */

    // Upload File to the targetFileURL.
    // If the targetFileURL exists, overwrite the file.
    // If the targetFileURL does not exist, create the file at the location.
    public async writeFileToPod(file: File, targetFileURL: string, makePublic: boolean = false) {

        const contentType = file.type ? file.type : "text/plain";

        const savedFile = await overwriteFile(
          targetFileURL,                              // URL for the file.
          file,                                       // File
          { contentType, fetch: fetch }    // mimetype if known, fetch from the authenticated session
        );
        console.log(`File saved at ${getSourceUrl(savedFile)}`);

        if(makePublic){
            await this._as.makeFilePublic(targetFileURL);
        }

        return savedFile;

    }

    public async getFile(fileURL: string) {
        console.log(`Getting file ${fileURL}...`);
        return getFile(
            fileURL,               // File in Pod to Read
            { fetch: fetch }       // fetch from authenticated session
        );
    }

    public async deleteFile(fileURL: string) {
        console.log(`Deleting file ${fileURL}...`);
        return deleteFile(
            fileURL,               // File in Pod to Read
            { fetch: fetch }       // fetch from authenticated session
        );
    }

    /**
     * SOLID DATASETS
     */

    // Method to read a document (image / file) as authorized
    public async getSolidDataset(documentURI: string) {
        console.log(`Getting solid dataset ${documentURI}...`);
        return getSolidDataset(
            documentURI,           // File in Pod to Read
            { fetch: fetch }       // fetch from authenticated session
        );
    }

    /**
     * CONTAINERS
     */

     public async createContainer(containerURL: string, makePublic: boolean = false) {
        
        console.log(`Creating container ${containerURL}...`);

        const datasetWithAcl = await createContainerAt(
            containerURL,          // File in Pod to Read
            { fetch: fetch }       // fetch from authenticated session
        );

        if(makePublic){
            await this._as.makePublic(containerURL);
        }

        return datasetWithAcl;
    }

    public async deleteContainer(containerURL: string, includeSubContainers: boolean = false) {

        // Default behavior is to just delete the container
        if(!includeSubContainers){
            console.log(`Deleting container ${containerURL}...`);
            return deleteContainer(
                containerURL,          // File in Pod to Read
                { fetch: fetch }       // fetch from authenticated session
            );
        }

        // If deleting subcontainers, we need to first get these
        else{
            console.log(`Deleting container ${containerURL} including its subfolders...`);
            const subContainers = await getSolidDataset(containerURL);
            console.log(subContainers);

        }
        
    }

    /**
     * GENERAL
     */

    // Check if the resource exists
    public async resourceExists(resourceURL: string): Promise<boolean>{
        console.log(`Checking if resource ${resourceURL} exists...`);
        const file = await this.getFile(resourceURL);
        return file ? true : false;
    }

}