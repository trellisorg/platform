import { getHonoServer, parseDistPaths, type Options } from '@trellisorg/ngx-hono-ssr';
import { serveStatic } from 'hono/bun';

type ServeStaticOptions = Parameters<typeof serveStatic>[0];

export interface BunServeOptions extends Pick<Options, 'bootstrap' | 'ng'> {
    serveStaticOptions?: ServeStaticOptions;
}

export function serve({ bootstrap, serveStaticOptions = {}, ng = {} }: BunServeOptions) {
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

    return {
        app,
    };
}
