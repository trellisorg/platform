import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
    DynamicOutletModule,
    RxDynamicComponentModule,
} from '@trellisorg/rx-dynamic-component';
import { AppComponent } from './app.component';
import { GameEffects } from './state/game.effects';
import { gameReducer, GAME_STATE } from './state/game.state';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], { initialNavigation: 'enabled' }),
        StoreModule.forRoot({
            [GAME_STATE]: gameReducer,
        }),
        EffectsModule.forRoot([GameEffects]),
        StoreDevtoolsModule.instrument({
            logOnly: false,
        }),
        ReactiveComponentModule,
        RxDynamicComponentModule.forRoot({
            manifests: [
                {
                    componentId: 'dead',
                    loadChildren: () =>
                        import('./dead/dead.module').then((m) => m.DeadModule),
                },
                {
                    componentId: 'alive',
                    loadChildren: () =>
                        import('./alive/alive.module').then(
                            (m) => m.AliveModule
                        ),
                },
            ],
        }),
        DynamicOutletModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
