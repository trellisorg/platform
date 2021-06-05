import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EntityDataModule, EntityDataService } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
    AngularFireNgrxAuthModule,
    AngularFireNgrxModule,
} from '@trellisorg/angularfire-ngrx';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

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
