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
        console.log('Hello World Fn');

        return 'Hello World Fn';
    }
}
