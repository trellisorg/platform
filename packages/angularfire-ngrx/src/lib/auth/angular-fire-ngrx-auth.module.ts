import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './auth-effects';

@NgModule({
    imports: [EffectsModule.forFeature([AuthEffects])],
})
export class AngularFireNgrxAuthModule {}
