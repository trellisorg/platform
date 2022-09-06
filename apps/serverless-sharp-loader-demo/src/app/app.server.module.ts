import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app-module';
import { AppComponent } from './app.component';

@NgModule({
    imports: [AppModule, ServerModule, BrowserModule.withServerTransition({ appId: 'app' })],
    bootstrap: [AppComponent],
})
export class AppServerModule {}
