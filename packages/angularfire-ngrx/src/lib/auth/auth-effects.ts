import { Injectable } from '@angular/core';
import { AngularFireNgrxAuthActions } from './angular-fire-ngrx-auth.actions';
import { createEffect } from '@ngrx/effects';

@Injectable({ providedIn: 'root' })
export class AuthEffects {
    allActions$ = createEffect(() => this.angularFireAuthActions);

    constructor(private angularFireAuthActions: AngularFireNgrxAuthActions) {}
}
