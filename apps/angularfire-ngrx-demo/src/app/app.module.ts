import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { AngularFireModule } from '@angular/fire';
import { AngularFireNgrxModule } from '@trellisorg/angularfire-ngrx';
import { AngularFireNgrxAuthModule } from '@trellisorg/angularfire-ngrx';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from '@angular/fire/auth';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], { initialNavigation: 'enabled' }),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        StoreDevtoolsModule.instrument({}),
        AngularFireNgrxModule.forRoot({ replay: false }),
        AngularFireNgrxAuthModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
