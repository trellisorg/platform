import {
    AfterViewInit,
    ChangeDetectorRef,
    ComponentRef,
    Directive,
    Injector,
    Input,
    OnDestroy,
    Type,
    ViewContainerRef,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { SharedManifestConfig } from './manifest';
import { RxDynamicComponentRegister } from './rx-dynamic-component.register';
import { RxDynamicComponentService } from './rx-dynamic-component.service';

@Directive({
    selector: '[rxDynamic]',
    standalone: true,
    providers: [RxDynamicComponentRegister],
})
export class RxDynamicDirective<TComponent>
    implements AfterViewInit, OnDestroy
{
    /**
     * Custom injector that will be used in the dynamic component
     */
    @Input() injector?: Injector;

    /**
     * Whether the component should be replaced or added into the `ViewContainerRef` to be rendered
     * alongside the previous dynamic components.
     */
    @Input() replace = true;

    /**
     * If `replace` is false then when inserting into the `ViewContainerRef` this will either create the component
     * at the "start" or the "end".
     */
    @Input() insertAtEnd = true;

    @Input() set load(
        componentType: string | Type<TComponent> | null | undefined
    ) {
        this.loadComponent(componentType);
    }

    @Input() config?: Pick<SharedManifestConfig, 'timeout' | 'priority'>;

    private _componentRef?: ComponentRef<TComponent>;

    private _componentType?: Type<TComponent> | null;

    private _index = 0;

    constructor(
        private readonly viewContainerRef: ViewContainerRef,
        private readonly rxDynamicComponentRegister: RxDynamicComponentRegister,
        private readonly rxDynamicComponentService: RxDynamicComponentService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    ngAfterViewInit(): void {
        if (this._componentType) {
            this.loadComponent(this._componentType);
        }
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnDestroy(): void {}

    /**
     * Function that will load the new factory into the outlet
     *
     * It will first clear the outlet so that previously rendered factories
     * are cleared and removed from the DOM
     *
     * It will then create the component from the factory using the ViewContainerRef
     * @param componentType
     */
    async loadComponent(
        componentType: string | Type<TComponent> | null | undefined
    ): Promise<void> {
        if (typeof componentType === 'string') {
            this._componentType = await firstValueFrom(
                this.rxDynamicComponentService.getComponent<TComponent>(
                    componentType,
                    this.config
                )
            );
        } else {
            this._componentType = componentType;
        }

        if (this.viewContainerRef) {
            if (this.replace) {
                this.viewContainerRef.clear();
            }

            if (this._componentType) {
                this._componentRef = this.viewContainerRef.createComponent(
                    this._componentType,
                    {
                        index: this.insertAtEnd ? undefined : 0,
                        injector: this.injector,
                    }
                );

                this._index += 1;

                /*
            Register the ComponentRef so it's inputs are passed down and the outputs are bubbled up
             */
                this.rxDynamicComponentRegister.registerComponentRef(
                    this._componentType,
                    this._componentRef,
                    this._index
                );

                this.changeDetectorRef.markForCheck();
            }
        }
    }
}
