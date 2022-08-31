import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    InjectionToken,
    Input,
    OnDestroy,
    Output,
    Provider,
} from '@angular/core';
import type { SharedManifestConfig } from '@trellisorg/rx-dynamic-component';
import { Logger, RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import { firstValueFrom } from 'rxjs';

export const RX_DYNAMIC_EVENT_LOAD_MANIFESTS = new InjectionToken<string | string[]>('rx-dynamic-event-load-manifests');

/**
 * Provide the manifests that should be preloaded by the directive as the provider level instead of inside the template.
 * @param manifests
 */
export function provideRxDynamicEventLoadManifests(manifests: string | string[]): Provider {
    return {
        provide: RX_DYNAMIC_EVENT_LOAD_MANIFESTS,
        useValue: manifests,
    };
}

export const DEFAULT_RX_DYNAMIC_LOAD_EVENTS = ['mouseover'];

export interface DynamicEventLoaded {
    manifestId: string;
    event: string;
}

const arraysEqual = (xs: string[], ys: string[]) => xs.length === ys.length && xs.every((x) => ys.includes(x));

@Directive({
    selector: '[rxDynamicLoad]',
    standalone: true,
})
export class RxDynamicLoadDirective implements AfterViewInit, OnDestroy {
    @Input() config?: Partial<Pick<SharedManifestConfig, 'timeout' | 'priority'>>;

    @Input() manifests?: string | string[] | null;

    @Input() set loadEvents(loadEvents: string[] | undefined | null) {
        const newEvents = loadEvents ?? DEFAULT_RX_DYNAMIC_LOAD_EVENTS;

        if (this.abortController && !arraysEqual(newEvents, this._loadEvents)) {
            this.abortController = this.resetListeners(this.abortController);

            this.addListeners(newEvents, this.abortController.signal);
        }

        this._loadEvents = newEvents;
    }

    @Output() readonly manifestLoaded = new EventEmitter<DynamicEventLoaded>();

    private _loadEvents: string[] = DEFAULT_RX_DYNAMIC_LOAD_EVENTS;

    private abortController?: AbortController;

    private manifestsLoaded: Set<string> = new Set<string>();

    private readonly rxDynamicEventLoadManifests = inject(RX_DYNAMIC_EVENT_LOAD_MANIFESTS, { optional: true });

    constructor(
        private readonly elementRef: ElementRef,
        private readonly rxDynamicComponentService: RxDynamicComponentService,
        private readonly logger: Logger
    ) {}

    ngAfterViewInit(): void {
        this.abortController = new AbortController();

        this.addListeners(this._loadEvents, this.abortController.signal);
    }

    resetListeners(abortController: AbortController): AbortController {
        if (!abortController.signal.aborted) {
            abortController.abort();
        }

        return new AbortController();
    }

    /**
     * Add an event listener for each configured event from the Input, will only listen once for each unique manifestId.
     *
     * If the event is fired when there is no manifestId the event listeners will be recreated so that if the manifestId
     * input gets updated that the event can fire again and load them.s
     * @param loadEvents
     * @param signal
     */
    addListeners(loadEvents: string[], signal: AbortSignal) {
        loadEvents.forEach((event) => {
            (this.elementRef.nativeElement as EventTarget).addEventListener(
                event,
                () => {
                    const manifests = [this.manifests ?? [], this.rxDynamicEventLoadManifests ?? []].flat();

                    if (manifests?.length) {
                        manifests.forEach((manifestId) => {
                            if (!this.manifestsLoaded.has(manifestId)) {
                                this.loadManifest(manifestId, event);
                            }
                        });
                    } else {
                        this.logger.error(`No manifests to preload.`);
                        this.addListeners(loadEvents, signal);
                    }
                },
                { once: true, passive: true, signal }
            );
        });
    }

    /**
     * Loads the manifest and adds it to the set of already loaded manifests, will ensure the AbortController is aborted
     * @param manifestId
     * @param event
     */
    async loadManifest(manifestId: string, event: string): Promise<void> {
        this.manifestsLoaded.add(manifestId);
        if (!this.abortController?.signal.aborted) {
            this.abortController?.abort();
        }
        await firstValueFrom(this.rxDynamicComponentService.getComponent(manifestId, this.config));

        this.manifestLoaded.emit({
            manifestId,
            event,
        });
    }

    /**
     * When this directive is destroyed we want to ensure that the current AbortController is aborted so that
     * the event listeners created are destroyed.
     */
    ngOnDestroy(): void {
        if (this.abortController && !this.abortController?.signal.aborted) {
            this.abortController.abort();
        }
    }
}
