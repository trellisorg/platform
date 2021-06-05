import { Injectable } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { AngularFireNgrxAuthActions } from './angular-fire-ngrx-auth.actions';

@Injectable({ providedIn: 'root' })
export class AuthEffects {
    allActions$ = createEffect(() => this.angularFireAuthActions);

    constructor(private angularFireAuthActions: AngularFireNgrxAuthActions) {}
}
