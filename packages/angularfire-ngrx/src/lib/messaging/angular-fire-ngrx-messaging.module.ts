import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { MessagingEffects } from './messaging-effects';

@NgModule({
    imports: [EffectsModule.forFeature([MessagingEffects])],
})
export class AngularFireNgrxMessagingModule {}
