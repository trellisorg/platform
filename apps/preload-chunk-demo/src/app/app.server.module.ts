import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServerModule } from '@angular/platform-server';
import { provideChunkPreloader } from '@trellisorg/preload-chunks';
import { join } from 'path';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

@NgModule({
    imports: [AppModule, ServerModule, BrowserModule.withServerTransition({ appId: 'app' })],
    bootstrap: [AppComponent],
    providers: [
        provideChunkPreloader({
            enabled: true,
            pathToBrowserFiles: join(__dirname, '../browser'),
            config: {
                type: 'importMap',
            },
        }),
    ],
})
export class AppServerModule {}
