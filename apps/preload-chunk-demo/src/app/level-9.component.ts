
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-9',
    template: `Level 9 <router-outlet></router-outlet>`,
})
export class Level9Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level9Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-10.component').then((m) => m.Level10Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level9Component],
})
export class Level9Module {}
