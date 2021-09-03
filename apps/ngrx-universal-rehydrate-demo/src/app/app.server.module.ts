import { NgModule } from '@angular/core';
import {
    ServerModule,
    ServerTransferStateModule,
} from '@angular/platform-server';
import { NgrxUniversalRehydrateServerModule } from '@trellisorg/ngrx-universal-rehydrate/server';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

@NgModule({
    imports: [
        AppModule,
        ServerModule,
        ServerTransferStateModule,
        NgrxUniversalRehydrateServerModule.forServer(),
    ],
    bootstrap: [AppComponent],
})
export class AppServerModule {}
