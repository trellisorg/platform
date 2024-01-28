import { ɵprovideZonelessChangeDetection, type ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [provideClientHydration(), provideRouter(appRoutes), ɵprovideZonelessChangeDetection()],
};
