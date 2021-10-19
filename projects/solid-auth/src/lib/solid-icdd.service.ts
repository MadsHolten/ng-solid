import { Injectable } from '@angular/core';

// Import from "@inrupt/solid-client-authn-browser"
import {
    fetch
} from "@inrupt/solid-client-authn-browser";

// Import from "@inrupt/solid-client"
import {
    createSolidDataset,
    buildThing,
    createThing,
    setThing,
    saveSolidDatasetAt
} from "@inrupt/solid-client";
import { SolidDataService } from './solid-data.service';
import { SolidAccessService } from './solid-access.service';
import { RDF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf';
import ICDD_C from './vocab/icdd-c';

import { urlJoin } from 'url-join-ts';

@Injectable({
    providedIn: 'root'
})
export class SolidICDDService {

    constructor(
        private _ds: SolidDataService,
        private _as: SolidAccessService
    ){}

    public async initICDD(rootURL: string, icddName: string, makePublic: boolean = true){

        // Create main folder
        const baseURL = urlJoin(rootURL, icddName, "/");
    
        // Might fail if folders already exist
        console.log(`Creating root container for ICDD...`);
        try{
          await this._ds.createContainer(baseURL, makePublic);
        }catch(err){
          console.log(`Could not create container ${baseURL}`);
          console.log(err);
        }
        
        // Create subfolders
        console.log(`Creating ICDD subfolders...`);
        let folderURLs = ["ontology_resources", "payload_triples", "payload_documents"].map(f => urlJoin(rootURL, icddName, f, "/"));
    
        let createFolderPromises: Promise<any>[] = [];
        folderURLs.forEach(url => {
          createFolderPromises.push(this._ds.createContainer(url, makePublic));
        });
    
        // Might fail if folders already exist
        try{
          await Promise.all(createFolderPromises);
        }catch(err){
          console.log(`Could not create sub-containers`);
          console.log(err);
        }
    
        // Add index.rdf
        // Might fail if folders already exist
        console.log(`Creating index.rdf...`);
        try{
            await this.buildIndex(baseURL, icddName, makePublic);
        }catch(err){
            console.log(`Could not create index-file`);
            console.log(err);
        }
    
        return "DONE";
    
    }

    public async buildIndex(rootURL: string, icddName: string, makePublic: boolean = true){

        let indexDataset = createSolidDataset();

        // Create container description
        // Use various add functions to add properties to the Thing
        // Note: solid-client functions do not modify objects passed in as arguments. 
        // Instead the functions return new objects with the modifications.
        const now = new Date();
        const containerDescription = buildThing(createThing())      // Build new resource (ID created by SDK)
            .addUrl(RDF.type, ICDD_C.ContainerDescription)          // Define type
            .addStringNoLocale(SCHEMA_INRUPT.name, icddName)        // Define type
            .addDatetime(ICDD_C.creationDate, now)                  // Set creation date
            .addDatetime(ICDD_C.modificationDate, now)              // Set modification date
            .build();
        
        // Update SolidDataset with the containerDescription Thing.
        // Note: solid-client functions do not modify objects passed in as arguments. 
        // Instead the functions return new objects with the modifications.
        indexDataset = setThing(indexDataset, containerDescription);
        
        // Save the SolidDataset at the specified URL.
        // The function returns a SolidDataset that reflects your sent data
        const datasetWithAcl = await saveSolidDatasetAt(
            urlJoin(rootURL, "index"),
            indexDataset,
            { fetch: fetch }
        );

        if(makePublic){
            await this._as.makePublic(urlJoin(rootURL, "index"));
        }

        return datasetWithAcl;
        

    }

}