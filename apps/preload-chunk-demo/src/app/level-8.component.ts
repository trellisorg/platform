
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-8',
    template: `Level 8 <router-outlet></router-outlet>`,
})
export class Level8Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level8Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-9.component').then((m) => m.Level9Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level8Component],
})
export class Level8Module {}
