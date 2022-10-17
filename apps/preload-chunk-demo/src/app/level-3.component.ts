
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-3',
    template: `Level 3 <router-outlet></router-outlet>`,
})
export class Level3Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level3Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-4.component').then((m) => m.Level4Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level3Component],
})
export class Level3Module {}
