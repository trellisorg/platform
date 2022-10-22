const { writeFileSync } = require('fs');

const component = `
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'tr-level-X',
    template: \`Level X <router-outlet></router-outlet>\`,
})
export class LevelXComponent {}

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: LevelXComponent,
                children: [
                    {
                        path: '',
                        loadChildren: () => import('./level-Y.component').then((m) => m.LevelYModule),
                    },
                ],
            },
        ]),
    ],
    declarations: [LevelXComponent],
})
export class LevelXModule {}
`;

for (let x = 0; x < 100; x++) {
    writeFileSync(
        `apps/preload-chunk-demo/src/app/level-${x}.component.ts`,
        component.replace(/X/g, x.toString(10)).replace(/Y/g, (x + 1).toString(10))
    );
}
