# @trellisorg/use-memo

Memoization functionality for Angular components, directives and services.

## Demo

Clone the repo and run: `yarn nx serve use-memo-demo`

## Install

yarn
`yarn add @trellisorg/use-memo`

npm
`npm i @trellisorg/use-memo --save`

## Usage

```typescript
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { useMemo } from '@trellisorg/use-memo';

@Component({
    selector: 'trellisorg-root',
    template: ` <div>{{ message() }}</div> `,
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
        }, 1000);
    }
}
```
