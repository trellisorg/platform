import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { LetModule, PushModule } from '@ngrx/component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { provideRxDynamicComponent, RxDynamicLoadDirective } from '@trellisorg/rx-dynamic-component';
import { AppComponent } from './app.component';
import { GameEffects } from './state/game.effects';
import { gameReducer, GAME_STATE } from './state/game.state';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
        StoreModule.forRoot({
            [GAME_STATE]: gameReducer,
        }),
        EffectsModule.forRoot([GameEffects]),
        StoreDevtoolsModule.instrument({
            logOnly: false,
        }),
        LetModule,
        PushModule,
        RxDynamicLoadDirective,
    ],
    providers: [
        provideRxDynamicComponent({
            manifests: [
                {
                    componentId: 'dead',
                    loadComponent: () => import('./dead.component').then((m) => m.DeadComponent),
                },
                {
                    componentId: 'alive',
                    loadComponent: () => import('./alive.component').then((m) => m.AliveComponent),
                },
            ],
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
