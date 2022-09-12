import { Component } from '@angular/core';

@Component({
    selector: 'trellisorg-root',
    template: `
        <div>No image loader</div>
        <div style="border: dotted red; padding: 5px">
            <img
                src="https://trellis-dev-images.s3.ca-central-1.amazonaws.com/50Pf2lJWu2-photo.png"
                width="500"
                height="280"
            />
        </div>
        <div>With image loader</div>
        <div style="border: dotted blue; padding: 5px">
            <img
                rawSrc="https://trellis-dev-images.s3.ca-central-1.amazonaws.com/50Pf2lJWu2-photo.png"
                width="500"
                height="280"
                priority
            />
        </div>
        <div>With image loader and preloaded</div>
        <div style="border: dotted blue; padding: 5px">
            <img
                rawSrc="https://trellis-dev-images.s3.ca-central-1.amazonaws.com/50Pf2lJWu2-photo.png#preload"
                width="500"
                height="280"
                priority
            />
        </div>
    `,
    styles: [``],
})
export class AppComponent {
    constructor() {
        import('./dynamic.component');
        import('./dynamic1.component');
        import('./dynamic2.component');
        import('./dynamic3.component');
    }
}
