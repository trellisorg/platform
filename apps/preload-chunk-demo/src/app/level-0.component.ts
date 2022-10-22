
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-0',
    template: `Level 0 <router-outlet></router-outlet>`,
})
export class Level0Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level0Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-1.component').then((m) => m.Level1Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level0Component],
})
export class Level0Module {}
