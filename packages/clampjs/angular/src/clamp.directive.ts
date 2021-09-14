import { isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    Output,
    PLATFORM_ID,
} from '@angular/core';
import { ClampJs } from '@trellisorg/clampjs';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[clamp]',
})
export class ClampDirective implements AfterViewInit {
    @Input() lines: number | 'auto' = 3;

    @Input() useNativeClamp: boolean = true;

    @Input() truncationChar: string = '...';

    @Input() splitOnChars?: string[];

    @Input() animate: boolean = false;

    @Input() showReadMore: boolean = true;

    @Output() readonly readMore: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private el: ElementRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngAfterViewInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            new ClampJs(this.el.nativeElement, {
                clamp: this.lines,
                showReadMore: this.showReadMore,
                useNativeClamp: this.useNativeClamp,
                truncationChar: this.truncationChar,
                splitOnChars: this.splitOnChars,
                callback: () => {
                    this.readMore.emit();
                },
            });
        }
    }
}
