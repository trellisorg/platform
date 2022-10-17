import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-10',
    template: `Level 10 <router-outlet></router-outlet>`,
})
export class Level10Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level10Component,
                children: [],
            },
        ]),
    ],
    declarations: [Level10Component],
})
export class Level10Module {}
