
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-7',
    template: `Level 7 <router-outlet></router-outlet>`,
})
export class Level7Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level7Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-8.component').then((m) => m.Level8Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level7Component],
})
export class Level7Module {}
