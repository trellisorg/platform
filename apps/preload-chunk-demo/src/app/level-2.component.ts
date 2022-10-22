
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-2',
    template: `Level 2 <router-outlet></router-outlet>`,
})
export class Level2Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level2Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-3.component').then((m) => m.Level3Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level2Component],
})
export class Level2Module {}
