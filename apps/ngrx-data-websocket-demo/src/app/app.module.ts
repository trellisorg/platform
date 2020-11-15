import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { EntityDataModule } from '@ngrx/data';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { NgrxDataWebsocketClientModule } from '@trellisorg/ngrx-data-websocket-client';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], { initialNavigation: 'enabled' }),
        DragDropModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        EntityDataModule.forRoot({
            entityMetadata: {
                Product: {
                    entityName: 'Story',
                    selectId: (model) => model.id,
                },
            },
        }),
        StoreDevtoolsModule.instrument({}),
        HttpClientModule,
        HttpClientJsonpModule,
        NgrxDataWebsocketClientModule.forRoot({
            host: 'http://localhost:80',
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
