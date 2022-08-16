import { ComponentRef, EventEmitter, Injectable, OnDestroy, reflectComponentType, Type } from '@angular/core';
import { map, Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Logger } from './logger';

export interface DynamicOutput<T, TComponent> {
    data: T;
    componentRef: ComponentRef<TComponent>;
}

export interface DynamicOutputEmission<T, TComponent> {
    output: string;
    value: DynamicOutput<T, TComponent>;
}

@Injectable()
export class RxDynamicComponentRegister implements OnDestroy {
    private readonly inputs = new Set<string>();

    private readonly inputValues = new Map<string, unknown>();

    private readonly outputs = new Set<string>();

    private readonly _events$ = new Subject<DynamicOutputEmission<any, unknown>>();

    private _componentRef?: ComponentRef<unknown>;

    private _component?: Type<unknown>;

    readonly events$ = this._events$.asObservable();

    readonly destroy$ = new Subject<void>();

    constructor(private readonly logger: Logger) {}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    registerComponentRef<TComponent = unknown>(
        component: Type<TComponent>,
        componentRef: ComponentRef<TComponent>
    ): void {
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
                subscriptions.push(
                    ((componentRef.instance as any)[output.templateName] as EventEmitter<any>).subscribe((value) =>
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
                subscriptions.forEach((subscription) => subscription.unsubscribe());
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

    /**
     * Filter the output stream so only outputs that match a certain string make it through
     * and are bubbled up to the template rendering the dynamic component.
     * @param output
     */
    filterOutputs(output: string): Observable<DynamicOutput<any, unknown>> {
        return this.events$.pipe(
            filter((event) => event.output === output),
            map((event) => event.value)
        );
    }
}
