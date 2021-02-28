import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
import { EntityDataModule, EntityDataService } from '@ngrx/data';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], {
            initialNavigation: 'enabled',
            relativeLinkResolution: 'legacy',
        }),
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
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private entityDataService: EntityDataService) {}
}
