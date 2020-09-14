import { Injectable } from '@angular/core';
import {
  AngularFireActions,
  AngularFireNgrxModule,
  authStateChanged,
} from '@trellis/angularfire-ngrx';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { AngularFireAuth } from '@angular/fire/auth';
import { hot } from 'jasmine-marbles';
import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MockService {
  constructor(public afActions: AngularFireActions) {}
}

describe('MockService', () => {
  let spectator: SpectatorService<MockService>;
  let service: MockService;

  let angularFireAuth: AngularFireAuth;
  let angularFireActions: AngularFireActions;

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
    angularFireActions = spectator.inject(AngularFireActions);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
