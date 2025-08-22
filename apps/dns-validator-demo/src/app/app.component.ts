import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DnsValidatorDirective } from '@trellisorg/dns-validator';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [FormsModule, DnsValidatorDirective, JsonPipe],
})
export class AppComponent {
    title = '';
}
