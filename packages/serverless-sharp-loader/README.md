# @trellisorg/serverless-sharp-loader

Demo

```bash
yarn nx serve-ssr serverless-sharp-loader-demo
```

## 1. Create AWS Resources

Follow this guide to set up a Lambda + API Gateway + CloudFront distribution to get your CDNs url.

https://venveo.github.io/serverless-sharp/index.html

## 2. Adding to project

Install

```bash
yarn add @trellisorg/serverless-sharp-loader
#OR
npm i --save @trellisorg/serverless-sharp-loader
```

In `AppModule` or in your `bootstrapApplication` function call add the following provider

```typescript
import { provideServerlessSharpLoader } from '@trellisorg/serverless-sharp-loader';
import { NgModule } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

// AppModule
@NgModule({
    providers: [
        provideServerlessSharpLoader({
            baseUrl: '<CloudFront Distribution endpoint>',
            parameters: {
                auto: 'compress,format',
            },
        }),
    ],
})
class AppModule {}

// OR

// bootstrapApplication in main.ts (standalone components)
bootstrapApplication(AppComponent, {
    providers: [
        provideServerlessSharpLoader({
            baseUrl: '<CloudFront Distribution endpoint>',
            parameters: {
                auto: 'compress,format',
            },
        }),
    ],
});
```

Configuration also takes additional properties to configure how the URLs are requested from your `sharp` CDN.

See them [here](https://github.com/trellisorg/platform/blob/c0c94dfe560da86fa88b199d97c6a357cdbf3514/packages/serverless-sharp-loader/src/lib/provide-serverless-sharp-loader.ts#L17)

If wanting to use a `security key` with your deployed CDN then you need to have the `md5` package installed as a dependency
in your project.

## 3. Usage

Use the [NgOptimizedImage](https://angular.io/api/common/NgOptimizedImage) directive as you normally would.

## 4. Usage with Universal

One benefit of using Angular Universal with this [Image Loader](https://angular.io/api/common/IMAGE_LOADER)
is that it will automatically add `link[rel=preload]` tags to the `<head>` of your document so that priority images can be
loaded ahead of time to help with LCP.

There are some caveats here:

1. The `preload` link tag will only be added if your image's `rawSrc` value ends with `#preload`.
   This is a hack to get around the fact that it is not yet built into the `NgOptimizedImage` directive.
   Hopefully after [this PR](https://github.com/angular/angular/pull/47343) is released this functionality will be built
   into the directive and appending `#preload` will not be needed. In your template this would look something like
   `<img [rawSrc]="src + '#preload'" height="something" width="something">`.
2. There is an issue with the `NgOptimizedImage` directive right now in SSR where it is trying to access `document`
   directly due to there being an internal check that queries tags in the `<head>`. This can be avoided by either:
   Running in prod mode with by calling `enableProdMode()` in your `main.ts` or, not adding the `priority` attribute
   to your images (although this goes against the suggested usage). Another option for this caveat is to always call
   `enableProdMode()` when rendering in Angular Universal by not conditionally calling it in your `main.server.ts`.
   This will be a moot point when [this PR](https://github.com/angular/angular/pull/47353) is released.
3. There is slightly less validation of the URL happening in this `IMAGE_LOADER` than in the default provided loaders
   in `@angular/common` because it is not being created the same way. This will be fixed after
   [this PR](https://github.com/angular/angular/pull/47340)
