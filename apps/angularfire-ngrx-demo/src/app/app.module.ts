import { BrowserModule } from '@angular/platform-browser';
import { Injectable, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { AngularFireModule } from '@angular/fire';
import {
    AngularFireNgrxAuthModule,
    AngularFireNgrxModule,
} from '@trellisorg/angularfire-ngrx';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from '@angular/fire/auth';
import {
    EntityCollectionServiceElementsFactory,
    EntityDataModule,
    EntityDataService,
} from '@ngrx/data';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import {
    NgrxDataWebsocketModule,
    SocketCollectionServiceBase,
    SocketServiceElementsFactory,
} from '@trellisorg/ngrx-data-websocket';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], { initialNavigation: 'enabled' }),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        EntityDataModule.forRoot({
            entityMetadata: {
                Product: {
                    entityName: 'Product',
                },
            },
        }),
        StoreDevtoolsModule.instrument({}),
        AngularFireNgrxModule.forRoot({ replay: false }),
        AngularFireNgrxAuthModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgrxDataWebsocketModule.forRoot({
            host: 'http://localhost:80',
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private entityDataService: EntityDataService) {}
}
