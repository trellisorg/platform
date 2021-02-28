import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';

@Component({
    selector: 'trellis-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'angularfire-ngrx-demo';

    constructor(private angularFireAuth: AngularFireAuth) {
        this.angularFireAuth.setPersistence(
            firebase.auth.Auth.Persistence.NONE
        );
    }

    signInAnonymously(): void {
        this.angularFireAuth.signInAnonymously();
    }
}
