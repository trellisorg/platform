import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { delay, filter } from 'rxjs/operators';

/**
 * Thank you @gc_psk for the great Intersection Observer Directive!
 *
 * https://angularbites.com/intersection-observer-with-angular/
 */
@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'div[rxObserveIntersecting]',
})
export class ObserveIntersectingDirective
    implements OnDestroy, OnInit, AfterViewInit
{
    @Input() debounceTime = 0;

    @Input() config: IntersectionObserverInit = {
        threshold: [0.25],
        rootMargin: '0px',
    };

    @Output() visible = new EventEmitter<HTMLElement>();

    private observer: IntersectionObserver | undefined;
    private subject$ = new Subject<{
        entry: IntersectionObserverEntry;
        observer: IntersectionObserver;
    }>();

    constructor(private element: ElementRef) {}

    ngOnInit() {
        this.createObserver();
    }

    ngAfterViewInit() {
        this.startObservingElements();
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
        }

        this.subject$.next();
        this.subject$.complete();
    }

    private isVisible(element: HTMLElement): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const observer = new IntersectionObserver(([entry]) => {
                resolve(entry.intersectionRatio === 1);
                observer.disconnect();
            });

            observer.observe(element);
        });
    }

    private createObserver(): void {
        const isIntersecting = (entry: IntersectionObserverEntry) =>
            entry.isIntersecting || entry.intersectionRatio > 0;

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (isIntersecting(entry)) {
                    this.subject$.next({ entry, observer });
                }
            });
        }, this.config);
    }

    private startObservingElements(): Subscription | void {
        if (!this.observer) {
            return;
        }

        this.observer.observe(this.element.nativeElement);

        return this.subject$
            .pipe(delay(this.debounceTime), filter(Boolean))
            .subscribe(async ({ entry, observer }) => {
                const target = entry.target as HTMLElement;
                const isStillVisible = await this.isVisible(target);

                if (isStillVisible) {
                    this.visible.emit(target);
                    observer.unobserve(target);
                }
            });
    }
}
