import { APP_BASE_HREF } from '@angular/common';
import type { ApplicationRef, Type } from '@angular/core';
import { CommonEngine } from '@angular/ssr';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Options {
    bootstrap: Type<{}> | (() => Promise<ApplicationRef>);
}

export async function serve({ bootstrap }: Options) {
    const serverDistFolder = dirname(fileURLToPath(import.meta.url));
    const browserDistFolder = resolve(serverDistFolder, '../browser');
    const indexHtml = join(serverDistFolder, 'index.server.html');
    const staticDir = browserDistFolder.replace(process.cwd(), '');

    const app = new Hono();

    const commonEngine = new CommonEngine();

    app.get(
        '*.*',
        serveStatic({
            root: staticDir,
        })
    );

    app.get('*', (c) =>
        c.html(
            commonEngine.render({
                bootstrap,
                documentFilePath: indexHtml,
                url: c.req.raw.url,
                publicPath: browserDistFolder,
                providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
            })
        )
    );

    return {
        app,
    };
}
