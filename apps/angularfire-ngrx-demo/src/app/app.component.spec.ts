import { AngularFireAuth } from '@angular/fire/auth';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { mockProvider } from '@trellisorg/nest-spectator';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    let spectator: Spectator<AppComponent>;
    let component: AppComponent;
    const createComponent = createComponentFactory({
        component: AppComponent,
        providers: [
            mockProvider(AngularFireAuth, {
                setPersistence: () => {},
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
});
