import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DnsValidatorModule } from '@trellisorg/dns-validator';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, DnsValidatorModule, FormsModule, HttpClientModule],
    bootstrap: [AppComponent],
})
export class AppModule {}
