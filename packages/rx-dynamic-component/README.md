# @trellisorg/rx-dynamic-component

A library for dynamically loading angular modules and components anywhere in the DOM from any observable in your
application

Working example: check `apps/rx-dynamic-component-demo`

to run demo: `yarn nx serve rx-dynamic-component-demo` and navigate to `http://localhost:4200`

## Adding to your application:

### Define your modules and components to be lazy loaded

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

### Define your dynamic component manifests

```typescript
import { DynamicComponentManifest } from './rx-dynamic-component.manifest';

const manifests: DynamicComponentManifest[] = [
    // Using dynamic import
    {
        componentId: 'query1',
        loadChildren: () =>
            import('./query-param1/query-param1.module').then(
                (m) => m.QueryParam1Module
            ),
    },
    // Using direct module reference
    {
        componentId: 'query1',
        loadChildren: (m) => m.QueryParam1Module,
    },
];
```

### Import RxDynamicComponentModule into your root AppModule

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RxDynamicComponentModule } from '@trellisorg/rx-dynamic-component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        RxDynamicComponentModule.forRoot({
            devMode: true,
            manifests: [
                {
                    componentId: 'query1',
                    loadChildren: () =>
                        import('./query-param1/query-param1.module').then(
                            (m) => m.QueryParam1Module
                        ),
                },
            ],
        }),
        RouterModule.forRoot([]),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
```

You can enable `devMode` to have `console.warn`'s show up in the console of your application. By default, it is `false`.

There is also a `forFeature()` that can be used in feature modules to register manifests in other places as long
as `forRoot()` has been called.

### Setup an observable to trigger the creation of a ComponentFactory

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
    queryParamComponent$: Observable<ComponentFactory<any>>;

    constructor(
        private _route: ActivatedRoute,
        private rxDynamicComponentService: RxDynamicComponentService
    ) {
        this.queryParamComponent$ = this._route.queryParams.pipe(
            filter((params) => !!params['query']),
            switchMap((params) =>
                this.rxDynamicComponentService.getComponentFactory(
                    params['query']
                )
            )
        );
    }
}
```

This will setup an observable that listens on query params and loads the correct component factory. In our demo case it
is either `query1` or `query2`. The value you pass into `RxDynamicComponentService#getComponentFactory`
must equal one of the `componentId`s from the manifest you provided.

### (Optional) Import DynamicOutletModule into the component you will be dynamically loading into

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

<rx-dynamic-outlet [factory]="queryParamComponent$ | async"></rx-dynamic-outlet>
```

With that when the query params `query` property is equal to one of the manifest entries the corresponding Angular
component will be loaded into the DOM.
