import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { useMemo } from '@trellisorg/use-memo';

function f(): string {
    console.log('Returning hello world');
    return 'Hello World';
}

@Component({
    selector: 'trellisorg-root',
    template: ` <div>{{ message() }}</div> `,
})
export class AppComponent {
    readonly message = useMemo(f);

    constructor() {
        const ref = inject(ChangeDetectorRef);

        setInterval(() => {
            this.message();
            ref.detectChanges();
        }, 1000);
    }
}
