import { APP_BASE_HREF } from '@angular/common';
import type { ApplicationRef, Type } from '@angular/core';
import { CommonEngine, CommonEngineRenderOptions } from '@angular/ssr';
import { Hono, type MiddlewareHandler } from 'hono';

export interface Options {
    // eslint-disable-next-line @typescript-eslint/ban-types
    bootstrap: Type<{}> | (() => Promise<ApplicationRef>);
    port?: number;
    serveStatic: MiddlewareHandler;
    indexHtml: string;
    browserDistFolder: string;

    ng?: Omit<CommonEngineRenderOptions, 'bootstrap'>;
}

export function getHonoServer({ bootstrap, serveStatic, indexHtml, browserDistFolder, ng }: Options) {
    const app = new Hono();

    const commonEngine = new CommonEngine();

    app.get('*.*', serveStatic);

    app.get('*', (c) => {
        return c.html(
            commonEngine.render({
                documentFilePath: indexHtml,
                url: c.req.raw.url,
                publicPath: browserDistFolder,
                providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
                ...ng,
                bootstrap,
            })
        );
    });

    return app;
}
