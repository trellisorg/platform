import { Injectable } from '@angular/core';
import { AngularFireNgrxModule } from '@trellis/angularfire-ngrx';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuthActions } from './angularfire-auth.actions';

@Injectable()
export class MockService {
    constructor(public afActions: AngularFireAuthActions) {}
}

describe('MockService', () => {
    let spectator: SpectatorService<MockService>;
    let service: MockService;

    let angularFireAuth: AngularFireAuth;
    let angularFireAuthActions: AngularFireAuthActions;

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
        angularFireAuthActions = spectator.inject(AngularFireAuthActions);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
