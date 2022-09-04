# @trellisorg/rx-dynamic-component

A library for dynamically loading angular modules and components anywhere in the DOM with support for Inputs and
Outputs.

Working example: check `apps/rx-dynamic-host`

to run demo: `yarn nx serve rx-dynamic-host` and navigate to `http://localhost:4200`

> Note: If you are using Angular <14 you will need to install v0.1.9, if using Angular ^14 any version will work.

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
    //...
})
export class StandaloneComponent {}
```

The above code was generated using `yarn nx g c query-param1 --standalone`.

### Define your dynamic component manifests

```typescript
import { DynamicComponentManifest } from '@trellisorg/rx-dynamic-component';

const manifests: DynamicComponentManifest[] = [
    // Using dynamic import and module + token
    {
        componentId: 'query1',
        loadChildren: () => import('./query-param1/query-param1.module').then((m) => m.QueryParam1Module),
    },
    // Using dynamic import and standalone component
    {
        componentId: 'standalone',
        loadComponent: () => import('./standalone/standalone.component').then((m) => m.StandaloneComponent),
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

There is also a `provideRxDynamicComponentManifests()` function that can be used in feature modules to register
manifests in other places as long as `provideRxDynamicComponent()` has been called.

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
        switchMap((params) => this.rxDynamicComponentService.getComponent(params['query']))
    );

    constructor(private _route: ActivatedRoute, private rxDynamicComponentService: RxDynamicComponentService) {}
}
```

This will set up an observable that listens on query params and loads the correct component factory. In our demo case it
is either `query1` or `query2`. The value you pass into `RxDynamicComponentService#getComponentFactory`
must equal one of the `componentId`s from the manifest you provided.

### Import RxDynamicDirective into the component you will be dynamically loading into

`rx-dynamic-directive` provides a directive that can be used that is set up for ease of use, but if you know what you
are doing you can implement whatever sort of outlet you want to render the component.

```typescript
import { RxDynamicDirective } from '@trellisorg/rx-dynamic-component/template';

@NgModule({
    declarations: [AppComponent],
    imports: [
        // ...other imports
        RxDynamicDirective,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
```

```angular2html
<!--Will load the outlet as soon as the observable emits-->
<div rxDynamic [load]='queryParamComponent$ | async'></div>
```

When the query params `query` property is equal to one of the manifest entries the corresponding Angular
component will be loaded into the DOM.

You can also load using the `manifestId` directly instead of a loaded component from a manifest from an observable.

```angular2html

<div rxDynamic
     load='query1'>
</div>
```

### Support for Inputs and Outputs

This library provides two decorators:

`@DynamicInput()` - Will pass inputs down into the dynamically rendered component
`@DynamicOutput()` - Will emit outputs up from the dynamically rendered component

This requires a bit of boilerplate and an adapter directive to support.

```typescript
import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { DynamicInput, DynamicOutput } from '@trellisorg/rx-dynamic-component/template';

@Directive({
    standalone: true,
    selector: '[inputOutputAdapter]',
})
export class StandaloneAdapterDirective implements OnDestroy {
    @DynamicInput() @Input() myInput: string | null = '';

    @DynamicOutput() @Output() myOutput = new EventEmitter<string>();
}
```

#### Usage

```angular2html
<div rxDynamic
     (myOutput)='myOutputCalled()'
     inputOutputAdapter
     myInput='Hello World'
     load='query1'>
</div>
```

This will allow you to pass inputs in and listen on outputs for your dynamically rendered component, if your component
changes (the `load` input changes) then the outputs will be unsubscribed from and will resubscribe to the new outputs on
the newly rendered dynamic component. Inputs will also be set if that input exists on the rendered component.

### Advanced manifest configuration

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

Each of the following properties can be configured globally (in `forRoot()`) or at the manifest level. Global values are
used if the manifest does not have a value set for that property, and the manifest level properties override global
properties.

#### Preloading

We can configure these manifests to be preloaded so that when we go to use them in our application the asset bundles
have already been downloaded to the browser.

`preload` - Whether this manifest should be preloaded or not

`priority` - Manifests can either be preloaded immediately or when the browser is idling as to not block the main
thread. Values will either be `'idle'` or `'immediate'`. `priority` will only be used if `preload: true`

`timeout` - The timeout to configure for `window.requestIdleCallback` that will preload the manifest in the background
when using `DynamicManifestPreloadPriority.IDLE`
Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback, `timeout` is ignored
if `preload: false` or `priority: 'immediate'`

### Manually preload manifests

The `RxDynamicComponentService` exposes a method that can be called to force a preload for a manifest.

`loadManifest(manifest: DynamicComponentManifest)`

You can also preload a manifest by hooking into DOM events using the `rxDynamicLoad` directive. The directive can be
attached to any DOM element and listen for an event to trigger a manifest preload.

Simple example:

```angular2html
<div rxDynamicLoad manifests="my-dynamic-component-manifest-id">
    Hovering on me will preload a manifest
</div>
```

Hovering over this element will trigger manifest preload so that it is loaded already when you go to render it.

You can also configure these template (and child template) wide by providing a manifestId or array of manifestIds.

```typescript
import { Component } from '@angular/core';
import { provideRxDynamicEventLoadManifests } from '@trellisorg/rx-dynamic-component/template';

@Component({
    selector: 'my-selector',
    template: `
        <div rxDynamicLoad manifests="my-dynamic-component-manifest-id">Hovering on me will preload the manifest</div>

        <div rxDynamicLoad manifests="my-dynamic-component-manifest-id">
            Hovering on me will also preload the manifest!
        </div>
    `,
    providers: [provideRxDynamicEventLoadManifests('my-dynamic-component-manifest-id')],
    imports: [RxDynamicLoadDirective],
})
class MySelectorComponent {}
```

This will allow multiple elements to trigger the same manifest preload, and you can reference your manifestIds in a type
safe way in the provider function by importing it!
