
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-4',
    template: `Level 4 <router-outlet></router-outlet>`,
})
export class Level4Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level4Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-5.component').then((m) => m.Level5Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level4Component],
})
export class Level4Module {}
