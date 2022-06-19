import { Component, Injectable, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { Update } from '@trellisorg/ngx-decorators';
import { BehaviorSubject } from 'rxjs';

@Injectable()
class Store {
    readonly counter$ = new BehaviorSubject<number>(0);

    readonly counter2$ = new BehaviorSubject<number>(0);

    readonly setCounter = (value: number) => this.counter$.next(value);

    readonly setCounterTwo = (value: number) => this.counter2$.next(value);
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'test',
    styles: [''],
    template: `<div id="input">
            {{ counter }}
        </div>
        <div id="observable">{{ counter$ | async }}</div>
        <div id="input">
            {{ counterTwo }}
        </div>
        <div id="observable">{{ counterTwo$ | async }}</div>`,
    providers: [Store],
})
class TestComponent {
    @Input() @Update(Store) counter = 0;

    @Input() @Update(Store, 'setCounterTwo') counterTwo = 0;

    readonly counter$ = this.store.counter$;

    readonly counterTwo$ = this.store.counter2$;

    constructor(private readonly store: Store) {}
}

describe('Update', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({ declarations: [TestComponent] });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;

        store = fixture.componentRef.injector.get(Store);
    });

    it('should create', () => {
        expect(component).toBeDefined();
        expect(store).toBeDefined();

        expect(subscribeSpyTo(store.counter$).getLastValue()).toEqual(0);
    });

    it('should update the store value', () => {
        component.counter = 1;

        fixture.detectChanges();

        expect(subscribeSpyTo(store.counter$).getLastValue()).toEqual(1);
    });

    it('should update the store value with renamed setter', () => {
        component.counterTwo = 1;

        fixture.detectChanges();

        expect(subscribeSpyTo(store.counter2$).getLastValue()).toEqual(1);
    });
});
