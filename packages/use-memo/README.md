# @trellisorg/use-memo

Memoization functionality for Angular components, directives and services.

## Demo

Clone the repo and run: `yarn nx serve use-memo-demo`

## Install

yarn
`yarn add @trellisorg/use-memo map-or-similar`

npm
`npm i @trellisorg/use-memo map-or-similar --save`

## Usage

```typescript
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { UseMemo, useMemo } from '@trellisorg/use-memo';

@Component({
    selector: 'trellisorg-root',
    template: `
        <div>{{ message() }}</div>
        <div>{{ messageFn() }}</div>
    `,
})
export class AppComponent {
    readonly message = useMemo(() => {
        // Will only be logged the first time, every subsequent change detection cycle is cached
        console.log('Returning hello world');
        return 'Hello World';
    });

    constructor() {
        const ref = inject(ChangeDetectorRef);

        setInterval(() => {
            ref.detectChanges();

            this.messageFn();
        }, 1000);
    }

    @UseMemo()
    messageFn(): string {
        // Will only be logged the first time, every subsequent change detection cycle is cached
        console.log('Hello World Fn');

        return 'Hello World Fn';
    }
}
```
