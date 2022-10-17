
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-1',
    template: `Level 1 <router-outlet></router-outlet>`,
})
export class Level1Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level1Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-2.component').then((m) => m.Level2Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level1Component],
})
export class Level1Module {}
