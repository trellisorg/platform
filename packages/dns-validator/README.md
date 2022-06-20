# @trellisorg/dns-validator

Directive that can be attached to a form control (`input` or `textarea`) that will validate the domain entered in using Googles public DNS-over-HTTP (DoH) JSON API.

Useful if you want to validate that the domain entered by a user matches some valid DNS query (like en email has a valid MX record for the entered domain for example).

## Install

yarn
`yarn add @trellisorg/dns-validator`

npm
`npm i @trellisorg/dns-validator --save`

## Usage

```angular2html
<input
    placeholder="Enter a domain"
    dns
    type="email"
    [query]="{ type: 'mx' }"
    #dnsValidator="dns"
/>

<div>{{ dnsValidator.response$ | async | json }}</div>
```

The `response$` observable will contain a `Status` property on it that correlates to if the DNS query is valid or not.

More info here:

https://developers.google.com/speed/public-dns/docs/doh
