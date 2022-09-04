import { AfterViewInit, Directive, inject, Injector, Input, OnDestroy, Type, ViewContainerRef } from '@angular/core';
import {
    RxDynamicComponentRegister,
    RxDynamicComponentService,
    RX_DYNAMIC_TRANSFER_SERVICE,
    SharedManifestConfig,
} from '@trellisorg/rx-dynamic-component';
import { firstValueFrom } from 'rxjs';

@Directive({
    selector: '[rxDynamic]',
    standalone: true,
    providers: [RxDynamicComponentRegister],
})
export class RxDynamicDirective<TComponent> implements AfterViewInit, OnDestroy {
    /**
     * Custom injector that will be used in the dynamic component
     */
    @Input() injector?: Injector;

    @Input() config?: Partial<Pick<SharedManifestConfig, 'timeout' | 'priority'>>;

    private _componentType?: Type<TComponent> | null;

    private _initialized = false;

    private _load?: string | Type<TComponent> | null;

    private readonly rxDynamicTransfer = inject(RX_DYNAMIC_TRANSFER_SERVICE, { optional: true });

    constructor(
        private readonly viewContainerRef: ViewContainerRef,
        private readonly rxDynamicComponentRegister: RxDynamicComponentRegister,
        private readonly rxDynamicComponentService: RxDynamicComponentService
    ) {}

    /**
     * The dynamic component to load. Will be either a manifestId or
     * @param componentType
     */
    @Input() set load(componentType: string | Type<TComponent> | null | undefined) {
        this._load = componentType;

        if (typeof componentType === 'string') {
            this.rxDynamicTransfer?.markUsed(componentType);
        }

        if (this._initialized) {
            this.setComponent(componentType);
        }
    }

    ngAfterViewInit(): void {
        this._initialized = true;

        if (this._load) {
            this.setComponent(this._load);
        }
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnDestroy(): void {
        /*
        This lifecycle hook is empty. It is only here so that we know this
        directive has the ngOnDestroy lifecycle hook, so we can hook into the
        onDestroy to unsubscribe from @Outputs in the @DynamicOutput decorator
         */
    }

    async setComponent(componentTypeOrManifestId: string | Type<TComponent> | null | undefined): Promise<void> {
        if (typeof componentTypeOrManifestId === 'string') {
            this._componentType = await firstValueFrom(
                this.rxDynamicComponentService.getComponent<TComponent>(componentTypeOrManifestId, this.config)
            );
        } else {
            this._componentType = componentTypeOrManifestId;
        }

        if (this._componentType) {
            this.loadComponent(this._componentType);
        }
    }

    /**
     * Function that will load the new factory into the outlet
     *
     * It will first clear the outlet so that previously rendered factories
     * are cleared and removed from the DOM
     *
     * It will then create the component from the factory using the ViewContainerRef
     * @param componentType
     */
    loadComponent(componentType: Type<TComponent>): void {
        if (this.viewContainerRef) {
            this.viewContainerRef.clear();

            if (this._componentType) {
                const componentRef = this.viewContainerRef.createComponent(componentType, {
                    injector: this.injector,
                });

                /*
                Register the ComponentRef so it's inputs are passed down and the outputs are bubbled up
                 */
                this.rxDynamicComponentRegister.registerComponentRef(componentType, componentRef);

                /*
                TODO(jay): Figure out why this needs detectChanges for the dynamic component to show up in some cases
                 */
                componentRef.changeDetectorRef.detectChanges();
            }
        }
    }
}
