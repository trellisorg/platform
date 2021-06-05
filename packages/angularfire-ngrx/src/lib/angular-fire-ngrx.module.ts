import { CommonModule } from '@angular/common';
import {
    ModuleWithProviders,
    NgModule,
    Optional,
    SkipSelf,
} from '@angular/core';
import { AF_NGRX_CONFIG, AngularFireNgrxConfig, defaultConfig } from './config';

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
                    provide: AF_NGRX_CONFIG,
                    useValue: {
                        ...defaultConfig,
                        ...config,
                    },
                },
            ],
        };
    }
}
