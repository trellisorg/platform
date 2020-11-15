import { Component, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import {
    SocketCollectionServiceBase,
    SocketServiceElementsFactory,
} from '@trellisorg/ngrx-data-websocket/client';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';

class Product {
    name: string;
    id: string;
}

@Injectable({
    providedIn: 'root',
})
export class ProductDataService extends SocketCollectionServiceBase<Product> {
    constructor(
        serviceElementsFactory: EntityCollectionServiceElementsFactory,
        socketServiceElementsFactory: SocketServiceElementsFactory<Product>
    ) {
        super('Product', serviceElementsFactory, socketServiceElementsFactory);
    }
}

@Component({
    selector: 'trellis-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'angularfire-ngrx-demo';

    constructor(
        private angularFireAuth: AngularFireAuth,
        public productDataService: ProductDataService
    ) {
        this.angularFireAuth.setPersistence(
            firebase.auth.Auth.Persistence.NONE
        );

        this.productDataService.connect({});
    }

    signInAnonymously(): void {
        this.angularFireAuth.signInAnonymously();
    }
}
