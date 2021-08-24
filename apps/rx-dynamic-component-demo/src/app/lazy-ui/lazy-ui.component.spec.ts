import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LazyUiComponent } from './lazy-ui.component';

describe('LazyUiComponent', () => {
    let component: LazyUiComponent;
    let fixture: ComponentFixture<LazyUiComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LazyUiComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LazyUiComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
