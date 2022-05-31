# @trellisorg/rx-dynamic-component

A library for dynamically loading angular modules and components anywhere in the DOM from any observable in your
application

Working example: check `apps/rx-dynamic-component-demo`

to run demo: `yarn nx serve rx-dynamic-component-demo` and navigate to `http://localhost:4200`

## Adding to your application:

### Define your modules and components to be lazy loaded

#### With a Module and `DYNAMIC_COMPONENT` token

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryParam1Component } from './query-param1.component';
import { DYNAMIC_COMPONENT } from '@trellisorg/rx-dynamic-component';

@NgModule({
    declarations: [QueryParam1Component],
    exports: [QueryParam1Component],
    imports: [CommonModule],
    providers: [
        {
            provide: DYNAMIC_COMPONENT,
            useValue: QueryParam1Component,
        },
    ],
})
export class QueryParam1Module {}
```

The above code was generated using `yarn nx g (m|c) query-param1`.

Note the `DYNAMIC_COMPONENT` injection token that provides the Component that will be dynamically loaded into the DOM.
This is required otherwise `rx-dynamic-component`
is not able to resolve and know what to render

#### With a standalone component

```typescript
@Component({
    standalone: true,
    // rest
})
export class StandaloneComponent {}
```

The above code was generated using `yarn nx g c query-param1 --standalone`.

### Define your dynamic component manifests

```typescript
import { DynamicComponentManifest } from './rx-dynamic-component.manifest';

const manifests: DynamicComponentManifest[] = [
    // Using dynamic import and module + token
    {
        componentId: 'query1',
        loadChildren: () =>
            import('./query-param1/query-param1.module').then(
                (m) => m.QueryParam1Module
            ),
    },
    // Using dynamic import and standalone component
    {
        componentId: 'standalone',
        loadComponent: () =>
            import('./standalone/standalone.component').then(
                (m) => m.StandaloneComponent
            ),
    },
    // Using direct module reference
    {
        componentId: 'query1',
        loadChildren: (m) => m.QueryParam1Module,
    },
];
```

### Provide into your root AppModule

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RxDynamicComponentModule } from '@trellisorg/rx-dynamic-component';
import { RouterModule } from '@angular/router';
import { provideRxDynamicComponent } from './rx-dynamic-component.providers';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, RouterModule.forRoot([])],
    providers: [
        // Note: This used to be `RxDynamicComponentModule.forRoot()` imported into the `imports` array
        provideRxDynamicComponent({
            manifests: [
                // manifests
            ],
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
```

You can enable `devMode` to have `console.warn`'s show up in the console of your application. By default, it is `false`.

There is also a `provideRxDynamicComponentManifests()` function that can be used in feature modules to register manifests in other places as long
as `provideRxDynamicComponent()` has been called.

### Set up an observable to trigger the creation of a ComponentFactory

```typescript
import { Component, ComponentFactory } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RxDynamicComponentService } from '@trellisorg/rx-dynamic-component';
import { filter, switchMap } from 'rxjs/operators';

@Component({
    selector: 'trellisorg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    queryParamComponent$ = this._route.queryParams.pipe(
        filter((params) => !!params['query']),
        switchMap((params) =>
            this.rxDynamicComponentService.getComponent(params['query'])
        )
    );

    constructor(
        private _route: ActivatedRoute,
        private rxDynamicComponentService: RxDynamicComponentService
    ) {}
}
```

This will set up an observable that listens on query params and loads the correct component factory. In our demo case it
is either `query1` or `query2`. The value you pass into `RxDynamicComponentService#getComponentFactory`
must equal one of the `componentId`s from the manifest you provided.

### (Optional) Import DynamicOutletModule or LazyDynamicOutletModule into the component you will be dynamically loading into

`rx-dynamic-component` provides a component that can be used that is setup with an internal `ViewContainerRef`
for ease of use, but if you know what you are doing you can implement whatever sort of `ViewContainerRef` you want.

```typescript
@NgModule({
    declarations: [AppComponent],
    imports: [
        // other imports
        DynamicOutletModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
```

```angular2html
<!--Will load the outlet as soon as the observable emits-->
<rx-dynamic-outlet [load]="queryParamComponent$ | async"></rx-dynamic-outlet>
<!--Will load the outlet as soon as the observable emits assuming the component is in view with IntersectionObserver-->
<rx-lazy-dynamic-outlet [load]="queryParamComponent$ | async"></rx-lazy-dynamic-outlet>
```

With that when the query params `query` property is equal to one of the manifest entries the corresponding Angular
component will be loaded into the DOM.

### (Optional) Add custom lazy loading support to your elements with ObserveIntersectingDirective

```angular2html
<!--Will only be loaded once the element is scrolled into view-->
<div rxObserveIntersecting>
</div>
```

Can be globally configured with the `INTERSECTION_OBSERVER_CONFIG` Injection token

```typescript
import { NgModule } from '@angular/core';

@NgModule({
    providers: [
        {
            provide: INTERSECTION_OBSERVER_CONFIG,
            useValue: IntersectionObserverInit // See: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver
        }
    ]
})
AppModule {}
```

You can also pass in the a `Partial<IntersectionObserverInit>` object to the element itself

```angular2html
<!--Will only be loaded once the element is scrolled into view-->
<div rxObserveIntersecting [config]='Partial<IntersectionObserverInit>'>
</div>
```

### (Optional) Advanced manifest configuration

`rx-dynamic-component` provides the ability to preload manifests.

Manifest Configuration:

```typescript
export interface DynamicComponentManifest<T = string> {
    preload?: boolean;
    priority?: DynamicManifestPreloadPriority;
    timeout?: number;
    cacheFactories?: boolean;
    componentId: T;
    // Required if `loadComponent` is omitted
    loadChildren: LoadChildrenCallback;
    // Required if `loadChildren` is omitted
    loadComponent: LoadComponentCallback;
}
```

We have already seen `componentId` and `loadChildren` above in the first couple of steps.

Each of the following properties can be configured globally (in `forRoot()`) or at the manifest level. Global values are used if the manifest does not
have a value set for that property, and the manifest level properties override global properties.

#### Preloading

We can configure these manifests to be preloaded so that when we go to use them in our application the asset bundles have already
been downloaded to the browser.

`preload` - Whether this manifest should be preloaded or not

`priority` - Manifests can either be preloaded immediately or when the browser is idling as to not block the main thread.
Values will either be `DynamicManifestPreloadPriority.IDLE` or `DynamicManifestPreloadPriority.IMMEDIATE`. `priority` will only be used if
`preload: true`

`timeout` - The timeout to configure for `window.requestIdleCallback` that will preload the manifest in the background when using `DynamicManifestPreloadPriority.IDLE`
Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback, `timeout` is ignored if `preload: false` or `priority: 'immediate'`

#### Caching

`cacheFactories` - Will cache the `ComponentFactory` pulled from the manifest if set to true. Still a little buggy in certain cases but works for the majority.

### (Optional) Manually preload manifests

The `RxDynamicComponentService` exposes a method:

`loadManifest(componentId: string, priority: DynamicManifestPreloadPriority = DynamicManifestPreloadPriority.IDLE)`

that can be called to force a preload for a manifest. Global and Manifest configurations are ignored in this case and instead the values passed
in will determine how to preload the manifest.
