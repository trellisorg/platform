import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs';
import { AngularFireNgrxModule } from '../angular-fire-ngrx.module';
import { AngularFireNgrxAuthActions } from './angular-fire-ngrx-auth.actions';

@Injectable()
export class MockService {
    constructor(public afActions: AngularFireNgrxAuthActions) {}
}

describe('MockService', () => {
    let spectator: SpectatorService<MockService>;
    let service: MockService;

    let angularFireAuth: AngularFireAuth;
    let angularFireAuthActions: AngularFireNgrxAuthActions;

    const authState = new BehaviorSubject<firebase.User | null>(null);
    const idToken = new BehaviorSubject<string | null>(null);
    const idTokenResult = new BehaviorSubject<firebase.auth.IdTokenResult | null>(
        null
    );
    const user = new BehaviorSubject<firebase.User | null>(null);

    const createService = createServiceFactory({
        service: MockService,
        imports: [AngularFireNgrxModule.forRoot({ replay: false })],
        providers: [
            {
                provide: AngularFireAuth,
                useValue: {
                    authState: authState.asObservable(),
                    idToken: idToken.asObservable(),
                    idTokenResult: idTokenResult.asObservable(),
                    user: user.asObservable(),
                },
            },
        ],
    });

    beforeEach(() => {
        spectator = createService();
        service = spectator.service;

        angularFireAuth = spectator.inject(AngularFireAuth);
        angularFireAuthActions = spectator.inject(AngularFireNgrxAuthActions);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
