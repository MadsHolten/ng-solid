import { InjectionToken } from '@angular/core';

export const CONFIG = new InjectionToken(
'CONFIG'
);

export interface Config {
    appName: string;
}
