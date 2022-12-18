import { Component } from '@angular/core';
import { byText, createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import {
    provideRxDynamicComponent,
    RxDynamicComponentService,
    RxDynamicDirective,
} from '@trellisorg/rx-dynamic-component';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'container',
    template: ` <div [load]="factory$ | async" rxDynamic></div>`,
    styles: [''],
})
class ContainerComponent {
    readonly factory$ = of('dynamic-lazy-child1').pipe(
        switchMap((componentId) => this.rxDynamicComponentService.getComponent(componentId))
    );

    constructor(private rxDynamicComponentService: RxDynamicComponentService) {}
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'lazy-child1',
    template: ` <div data-testid="lazyChildDiv">lazyChildDiv</div>`,
    standalone: true,
})
class LazyChild1Component {}

describe('RxDynamicComponent', () => {
    let spectator: Spectator<ContainerComponent>;
    let component: ContainerComponent;

    const createComponent = createComponentFactory({
        component: ContainerComponent,
        imports: [RxDynamicDirective],
        providers: [
            provideRxDynamicComponent({
                devMode: true,
                manifests: [
                    {
                        componentId: 'dynamic-lazy-child1',
                        loadComponent: () => LazyChild1Component,
                    },
                ],
            }),
        ],
    });

    beforeEach(() => {
        spectator = createComponent();
        component = spectator.component;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should match snapshot', () => {
        spectator.detectChanges();
        expect(spectator.query(byText('lazyChildDiv'))).toBeTruthy();
    });
});
