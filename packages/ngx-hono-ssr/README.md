# ngx-hono-ssr

## Installation

### Node

1. Yarn: `yarn add @trellisorg/ngx-hono-ssr hono @hono/node-server`
2. NPM: `npm i --save @trellisorg/ngx-hono-ssr hono @hono/node-server`
3. Bun: `bun install @trellisorg/ngx-hono-ssr hono @hono/node-server`

### Bun

1. Yarn: `yarn add @trellisorg/ngx-hono-ssr hono`
2. NPM: `npm i --save @trellisorg/ngx-hono-ssr hono`
3. Bun: `bun install @trellisorg/ngx-hono-ssr hono`

## Setup

In your Angular applications `server.ts` file (or whatever is configured in the `ssr.entry` property in your
`(angular|project).json` file) update it to use the `@trellisorg/ngx-hono-ssr` package like so:

### Node

```typescript
import { serve } from '@trellisorg/ngx-hono-ssr/node';
// Import the `bootstrap` function that is exported from typically the `main.server.ts` file.
import bootstrap from './src/main.server';

const PORT = 4000;

serve({ bootstrap, port: PORT });

console.log(`Node server listening at: http://localhost:${PORT}`);
```

The `serve` function handles all assets discovering and static asset serving but provides the ability to overload any property
of the `serveStatic` middleware from `@hono/node-server` as well as the properties passed to the `@angular/ssr` `CommonEngine`
responsible for the server side rendering process.

Once this is done run your build process and serve the application.

_Note: You cannot use the `serve` target of your application and use the Angular dev server for this because Angular does not use your `server.ts` during development, instead it uses an internal Vite Dev Server._

References:

1. [Node Hono](https://hono.dev/getting-started/nodejs)

### Bun

```typescript
import { serve } from '@trellisorg/ngx-hono-ssr/bun';
// Import the `bootstrap` function that is exported from typically the `main.server.ts` file.
import bootstrap from './src/main.server';

const { app } = serve({ bootstrap });

export default {
    fetch: app.fetch,
    port: 4000,
};
```

Similarly to the `Node` version above, the `serve` function takes the same options and configurations to customize the initialization of the
static asset middleware and Angular `CommonEngine`

_Note: If serving using `bun` you must make sure your application is initialized in zoneless mode by providing the
`ɵprovideZonelessChangeDetection()` function in your applications config as `zone.js` conflicts with Bun and will cause your application to not render._

References:

1. [Bun Hono](https://hono.dev/getting-started/bun)

## Example

See `apps/hono-ssr-demo` for a full example of this working. Run either:

1. `npx nx build-node hono-ssr-demo && node dist/apps/hono-ssr-demo/server/server/mjs`
2. `npx nx build-bun hono-ssr-demo && bun run dist/apps/hono-ssr-demo/server/server/mjs`

And then go to `http://localhost:4000`
