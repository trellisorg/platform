import { Injectable } from '@angular/core';
import { AngularFireAuthActions } from './angularfire-auth.actions';
import { createEffect } from '@ngrx/effects';

@Injectable({ providedIn: 'root' })
export class AuthEffects {
    allActions$ = createEffect(() => this.angularFireAuthActions);

    constructor(private angularFireAuthActions: AngularFireAuthActions) {}
}
