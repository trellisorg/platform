import { serve as serveNode } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { getHonoServer, parseDistPaths, type Options } from '@trellisorg/ngx-hono-ssr';

export interface NodeServeOptions extends Pick<Options, 'bootstrap' | 'port' | 'ng'> {
    serveStaticOptions?: Parameters<typeof serveStatic>[0];
}

export function serve({ bootstrap, port, ng = {}, serveStaticOptions = {} }: NodeServeOptions) {
    const { staticDir, indexHtml, browserDistFolder } = parseDistPaths();

    const app = getHonoServer({
        bootstrap,
        serveStatic: serveStatic({
            root: staticDir,
            ...serveStaticOptions,
        }),
        indexHtml,
        browserDistFolder,
        ng,
    });

    serveNode({
        fetch: app.fetch,
        port: port ?? 4000,
    });

    return {
        app,
    };
}
