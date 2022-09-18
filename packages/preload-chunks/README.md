# @trellisorg/preload-chunks

## Installation

`yarn add @trellisorg/preload-chunks`

## Why

When rendering applications in Universal some lazy chunks will be loaded while the page is being rendered, usually these
are the lazy loaded routes in your application but can be any lazy chunk. Once the static page is served to the browser
needs to pull these assets again, to help speed this process up and prepare these assets while the browser
is rendering the static page this plugin will add preload link tags so that lazy chunks can be scheduled ahead of time.

## Prerequisites

Have Angular Universal integrated into your application for server side rendering.

## Usage

In your `server.ts` file or wherever your rendering engine is initialized like so:

```typescript
server.engine(
    'html',
    ngExpressEngine({
        bootstrap: AppServerModule,
    })
);
```

_Note: If you are using something other than `@nguniversal/express` this may look different._

Provide the `provideChunkPreloader` function in the providers of your rendering engine, ensure that your path in the
correct path to where your browser assets are stored on the local file system.

```typescript
server.engine(
    'html',
    ngExpressEngine({
        bootstrap: AppServerModule,
        providers: [provideChunkPreloader(join(__dirname, '../browser'))],
    })
);
```
