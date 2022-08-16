import { ComponentRef, EventEmitter, Injectable, OnDestroy, reflectComponentType, Type } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Logger } from './logger';

export interface DynamicOutputPayload<T, TComponent> {
    data: T;
    componentRef: ComponentRef<TComponent>;
}

export interface DynamicOutputEmission<T, TComponent> {
    output: string;
    value: DynamicOutputPayload<T, TComponent>;
}

@Injectable()
export class RxDynamicComponentRegister implements OnDestroy {
    /**
     * Set of all inputs that the current dynamically rendered component has (based on its reflection).
     * @private
     */
    private readonly inputs = new Set<string>();

    /**
     * Set of all the outputs the current dynamically rendered component has (based on its reflection).
     * @private
     */
    private readonly outputs = new Set<string>();

    /**
     * The values each of the inputs that are set using the `@DynamicInput` decorator.
     * @private
     */
    private readonly inputValues = new Map<string, unknown>();

    /**
     * Stream of all the outputs (EventEmitters) values that the dynamically rendered component emits.
     * @private
     */
    private readonly _events$ = new Subject<DynamicOutputEmission<unknown, unknown>>();

    private _componentRef?: ComponentRef<unknown>;

    private _component?: Type<unknown>;

    readonly events$ = this._events$.asObservable();

    readonly destroy$ = new Subject<void>();

    constructor(private readonly logger: Logger) {}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    registerComponentRef<TComponent>(component: Type<TComponent>, componentRef: ComponentRef<TComponent>): void {
        const mirror = reflectComponentType(component);

        if (mirror) {
            this._componentRef = componentRef;
            this._component = component;

            this.inputs.clear();
            mirror.inputs.forEach((input) => {
                this.inputs.add(input.propName);

                /*
                While recording each input from the new component ref, if there is a value for that input then set it.
                 */
                if (this.inputValues.has(input.propName)) {
                    componentRef.setInput(input.propName, this.inputValues.get(input.propName));
                }
            });

            /*
            Pipe each output from the template into a single stream that will be passed up through into the template
            loading the dynamic component.
             */
            this.outputs.clear();
            const subscriptions: Subscription[] = [];
            mirror.outputs.forEach((output) => {
                this.outputs.add(output.propName);

                const emitter = (componentRef.instance as any)[output.templateName] as EventEmitter<
                    DynamicOutputPayload<unknown, Type<unknown>>
                >;

                subscriptions.push(
                    emitter.pipe(takeUntil(this.destroy$)).subscribe((value) =>
                        this._events$.next({
                            output: output.propName,
                            value: {
                                data: value,
                                componentRef,
                            },
                        })
                    )
                );
            });

            this._componentRef.onDestroy(() => {
                subscriptions.forEach((subscription) => {
                    if (!subscription.closed) {
                        subscription.unsubscribe();
                    }
                });
            });
        } else {
            this.logger.error(`Could not determine mirror for ${component} to determine inputs and outputs`);
        }
    }

    /**
     * Sets the value of an input on the currently rendered ComponentRef
     * @param input
     * @param value
     */
    setInput<T = unknown>(input: string, value: T): void {
        this.inputValues.set(input, value);

        if (
            this.inputs.has(input) &&
            this._componentRef &&
            /*
            Do not try and set the input if it has not changed. This is to prevent additional CD cycles.
             */
            (this._componentRef.instance as Record<string, unknown>)[input] !== value
        ) {
            this._componentRef.setInput(input, value);
        } else {
            this.logger.warn(`${this._component} does not have an input configured with @Input called ${input}.`);
        }
    }
}
