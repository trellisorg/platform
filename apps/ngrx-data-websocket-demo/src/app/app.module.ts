import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { EntityDataModule } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgrxDataWebsocketClientModule } from '@trellisorg/ngrx-data-websocket-client';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], {
            initialNavigation: 'enabledBlocking',
        }),
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
        StoreDevtoolsModule.instrument({ connectInZone: true }),
        HttpClientModule,
        HttpClientJsonpModule,
        NgrxDataWebsocketClientModule.forRoot({
            host: 'http://localhost:80',
        }),
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
