import { NgOptimizedImage } from '@angular/common';
import { APP_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideServerlessSharpLoader } from '@trellisorg/serverless-sharp-loader';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [NgOptimizedImage, BrowserModule],
    bootstrap: [AppComponent],
    providers: [
        provideServerlessSharpLoader({
            baseUrl: 'https://d19fj88dx7pejb.cloudfront.net',
            parameters: {
                auto: 'compress,format',
                s: 's',
            },
        }),
        {
            provide: APP_ID,
            useValue: 'app',
        },
    ],
})
export class AppModule {}
