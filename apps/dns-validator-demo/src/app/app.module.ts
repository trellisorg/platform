import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DnsValidatorModule } from '@trellisorg/dns-validator';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    imports: [BrowserModule, DnsValidatorModule, FormsModule],
    providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
