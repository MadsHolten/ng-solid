import { Injectable } from '@angular/core';

// https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/subscribe-to-notifications/?highlight=socket

import { fetch } from "@inrupt/solid-client-authn-browser";
import {
  WebsocketNotification,
} from "@inrupt/solid-client-notifications";

@Injectable({
    providedIn: 'root'
})
export class SolidNotificationsService {

    // Listen to changes on the resource
    public async getResourceChanges(containerUrl: string) {

      console.log(containerUrl);
        
      const websocket = new WebsocketNotification(
        containerUrl,
        { fetch: fetch }
      );
      
      websocket.on("message", (data) => {
        console.log(data);
      });
      
      websocket.connect();

    }

}