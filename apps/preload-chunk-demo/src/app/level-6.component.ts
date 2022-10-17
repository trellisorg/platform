
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-6',
    template: `Level 6 <router-outlet></router-outlet>`,
})
export class Level6Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level6Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-7.component').then((m) => m.Level7Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level6Component],
})
export class Level6Module {}
