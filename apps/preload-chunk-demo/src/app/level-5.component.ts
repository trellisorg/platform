
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-5',
    template: `Level 5 <router-outlet></router-outlet>`,
})
export class Level5Component {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: Level5Component,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-6.component').then((m) => m.Level6Module),
                    },
                ],
            },
        ]),
    ],
    declarations: [Level5Component],
})
export class Level5Module {}
