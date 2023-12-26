import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { LetDirective, PushPipe } from '@ngrx/component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { RxDynamicDirective, provideRxDynamicComponent } from '@trellisorg/rx-dynamic-component';
import { AppComponent } from './app.component';
import { GameEffects } from './state/game.effects';
import { GAME_STATE, gameReducer } from './state/game.state';

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
            connectInZone: true,
        }),
        LetDirective,
        PushPipe,
        RxDynamicDirective,
    ],
    providers: [
        provideRxDynamicComponent({
            manifests: [
                {
                    componentId: 'dead',
                    loadChildren: () => import('./dead/dead.module').then((m) => m.DeadModule),
                },
                {
                    componentId: 'alive',
                    loadChildren: () => import('./alive/alive.module').then((m) => m.AliveModule),
                },
            ],
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
