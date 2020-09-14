import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireNgrxConfig, defaultConfig } from './config';
import { AngularFireActions } from './angular-fire-actions';
import { AngularFireAuth } from '@angular/fire/auth';

// @dynamic
@NgModule({
  imports: [CommonModule],
})
export class AngularFireNgrxModule {
  constructor(@Optional() @SkipSelf() parentModule?: AngularFireNgrxModule) {
    if (parentModule) {
      throw new Error(
        'AngularFireNgrxModule is already loaded. Import it in the AppModule only'
      );
    }
  }

  static forRoot(
    config?: AngularFireNgrxConfig
  ): ModuleWithProviders<AngularFireNgrxModule> {
    return {
      ngModule: AngularFireNgrxModule,
      providers: [
        {
          provide: AngularFireActions,
          useFactory: (angularFireAuth: AngularFireAuth) =>
            new AngularFireActions(angularFireAuth, {
              ...defaultConfig,
              ...config,
            }),
          deps: [AngularFireAuth],
        },
      ],
    };
  }
}
