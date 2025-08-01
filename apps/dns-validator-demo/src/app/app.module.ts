import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [],
    bootstrap: [AppComponent],
    imports: [BrowserModule, AppComponent],
    providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
