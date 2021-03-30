import {
    byText,
    createComponentFactory,
    Spectator,
} from '@ngneat/spectator/jest';
import { Component, ComponentFactory, NgModule } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
    DYNAMIC_COMPONENT,
    DynamicOutletModule,
    RxDynamicComponentModule,
    RxDynamicComponentService,
} from '@trellisorg/rx-dynamic-component';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'container',
    template: ` <rx-dynamic-outlet
        [factory]="factory$ | async"
    ></rx-dynamic-outlet>`,
    styles: [''],
})
class ContainerComponent {
    factory$: Observable<ComponentFactory<any>>;

    constructor(private rxDynamicComponentService: RxDynamicComponentService) {
        this.factory$ = of('dynamic-lazy-child1').pipe(
            switchMap((componentId) =>
                this.rxDynamicComponentService.getComponentFactory(componentId)
            )
        );
    }
}

@Component({
    selector: 'lazy-child1',
    template: ` <div data-testid="lazyChildDiv">lazyChildDiv</div>`,
    styles: [''],
})
class LazyChild1Component {
    constructor() {}
}

@NgModule({
    declarations: [LazyChild1Component],
    exports: [LazyChild1Component],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: LazyChild1Component,
        },
    ],
    entryComponents: [LazyChild1Component],
})
class LazyChild1Module {}

describe('RxDynamicComponent', () => {
    let spectator: Spectator<ContainerComponent>;
    let component: ContainerComponent;

    const createComponent = createComponentFactory({
        component: ContainerComponent,
        imports: [
            RxDynamicComponentModule.forRoot({
                devMode: true,
                manifests: [
                    {
                        componentId: 'dynamic-lazy-child1',
                        loadChildren: () => LazyChild1Module,
                    },
                ],
            }),
            DynamicOutletModule,
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
