import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DnsValidatorDirective } from '@trellisorg/dns-validator';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [FormsModule, JsonPipe, DnsValidatorDirective],
})
export class AppComponent {
    title = '';
}
