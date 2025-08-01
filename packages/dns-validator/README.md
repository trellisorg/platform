# @trellisorg/dns-validator

Modern Angular directive that validates domains using Google's public DNS-over-HTTP (DoH) JSON API. Built with Angular signals, standalone components, and modern reactive patterns.

Useful for validating that user-entered domains have valid DNS records (e.g., checking if an email domain has valid MX records).

## Features

- ✨ **Modern Angular**: Built with Angular signals, standalone directives, and rxResource
- 🚀 **Performance**: Efficient debouncing and automatic request cancellation
- 🎯 **Type Safe**: Full TypeScript support with strict typing
- 🔧 **Configurable**: Customizable debounce time and transform functions
- 🧪 **Tested**: Comprehensive test coverage
- 📦 **Lightweight**: Minimal dependencies

## Install

### Yarn

```bash
yarn add @trellisorg/dns-validator
```

### NPM

```bash
npm i @trellisorg/dns-validator --save
```

## Usage

### Modern Standalone Approach (Recommended)

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DnsValidatorDirective } from '@trellisorg/dns-validator';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FormsModule, DnsValidatorDirective],
  template: `
    <input
      #dnsValidator="dns"
      [(ngModel)]="domain"
      [query]="{ type: 'mx' }"
      placeholder="Enter a domain"
      dns
      type="email" />

    <div>
      <p>Loading: {{ dnsValidator.isLoading() }}</p>
      <p>Invalid: {{ dnsValidator.invalid() }}</p>
      <p>Response: {{ dnsValidator.response() | json }}</p>
      @if (dnsValidator.error()) {
        <p style="color: red;">Error: {{ dnsValidator.error() | json }}</p>
      }
    </div>
  `,
})
export class ExampleComponent {
  domain = '';
}
```

### Legacy Module Approach (Deprecated)

```typescript
import { NgModule } from '@angular/core';
import { DnsValidatorModule } from '@trellisorg/dns-validator';

@NgModule({
  imports: [DnsValidatorModule],
})
export class AppModule {}
```

## API

### Directive Inputs

- `query`: `Omit<DoHQuery, 'name'>` - DNS query parameters (default: `{}`)
- `requiredValid`: `boolean` - Only validate when form control is valid (default: `true`)
- `transformFn`: `(value: string) => string` - Custom value transformation function

### Directive Outputs (Template Reference)

- `response()`: `DoHResponse | undefined` - DNS query response signal
- `invalid()`: `boolean` - Whether the DNS query is invalid signal
- `isLoading()`: `boolean` - Whether a DNS query is in progress signal
- `error()`: `any` - Error information if query failed signal

### Configuration

```typescript
import { provideDnsValidatorConfig } from '@trellisorg/dns-validator';

bootstrapApplication(AppComponent, {
  providers: [
    provideDnsValidatorConfig({
      debounceTime: 500, // Custom debounce time in ms
      transformFn: (value: string) => value.toLowerCase().trim(),
    }),
  ],
});
```

## DNS Query Types

The directive supports all DNS query types supported by Google's DoH API:

- `A` - IPv4 address records
- `AAAA` - IPv6 address records
- `MX` - Mail exchange records
- `TXT` - Text records
- `CNAME` - Canonical name records
- And more...

## Response Format

The `response()` signal contains a `Status` property that indicates the DNS query result:

- `0` - NOERROR (valid)
- `1` - FORMERR (format error)
- `2` - SERVFAIL (server failure)
- `3` - NXDOMAIN (non-existent domain)

More info: https://developers.google.com/speed/public-dns/docs/doh
