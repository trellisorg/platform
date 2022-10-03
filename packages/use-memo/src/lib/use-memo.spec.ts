import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { useMemo } from './use-memo';

@Component({
    selector: `trellisorg-test-use-memo`,
    template: ``,
    standalone: true,
})
export class TestUseMemoComponent {
    readonly fn = useMemo(() => {
        return this.anotherFn();
    });

    anotherFn = () => 0;
}

describe('useMemo', () => {
    let component: TestUseMemoComponent;
    let fixture: ComponentFixture<TestUseMemoComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({ imports: [TestUseMemoComponent] }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestUseMemoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    describe('useMemo', () => {
        it('should not call anotherFn twice', () => {
            jest.spyOn(fixture.componentInstance, 'anotherFn');
            fixture.componentInstance.fn();
            expect(fixture.componentInstance.anotherFn).toHaveBeenCalled();
            fixture.componentInstance.fn();
            expect(fixture.componentInstance.anotherFn).toBeCalledTimes(1);
        });
    });
});
