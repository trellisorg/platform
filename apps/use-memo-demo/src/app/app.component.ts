import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { useMemo } from '@trellisorg/use-memo';

@Component({
    selector: 'trellisorg-root',
    template: ` <div>{{ message() }}</div> `,
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
        }, 1000);
    }
}
