import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function parseDistPaths(): {
    serverDistFolder: string;
    browserDistFolder: string;
    indexHtml: string;
    staticDir: string;
} {
    const serverDistFolder = dirname(fileURLToPath(import.meta.url));
    const browserDistFolder = resolve(serverDistFolder, '../browser');
    const indexHtml = join(serverDistFolder, 'index.server.html');
    const staticDir = browserDistFolder.replace(process.cwd(), '');

    return {
        serverDistFolder,
        browserDistFolder,
        indexHtml,
        staticDir,
    };
}
