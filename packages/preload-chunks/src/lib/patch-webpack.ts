import { DOCUMENT } from '@angular/common';
import { ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { readdirSync } from 'fs';
import { join } from 'path';

/**
 * Matches chunks created by the Angular CLI.
 */
const CHUNK_REGEX = /^[0-9]*.[a-z0-9]*.js$/;

/**
 * Global webpack variable that is available during SSR when Angular is being rendered by Universal. We know this exists
 * so we define it (although it's very hacky)
 */
declare const __webpack_require__: { e: (moduleId: string) => unknown };

/**
 * Typically when building the server bundles hashes are not included in the file names like they are for the browser
 * files because there is no caches that need to be broken. Because of this there is no direct 1:1 between file names
 * of server files and browser files, but the chunk number or name will be the same so we store a map of moduleIds to
 * look up the corresponding browser file by moduleId
 *
 * Browser: main.<hash>.js
 * Server: main.js
 * @param pathToBrowserFiles
 */
function readChunkMap(pathToBrowserFiles: string): Record<string, string> {
    const chunks = readdirSync(join(pathToBrowserFiles)).filter((fileName: string) =>
        new RegExp(CHUNK_REGEX).test(fileName)
    );

    return chunks.reduce(
        (prev: Record<string, string>, cur: string) => ({
            ...prev,
            [cur.split('.').shift()!]: cur,
        }),
        {}
    );
}

/**
 * A provider function to be used within the server so that any lazy chunk that is loaded and thus needed to render
 * the page that is sent to the client will have a `<link rel="modulepreload" href="<chunk path>">` tag in the SSR'd
 * documents `<head>`
 *
 * @param pathToBrowserFiles
 */
export function provideChunkPreloader(pathToBrowserFiles: string) {
    const moduleMap = readChunkMap(pathToBrowserFiles);
    return {
        provide: ENVIRONMENT_INITIALIZER,
        useValue() {
            const document = inject(DOCUMENT);

            const originalE = __webpack_require__.e;

            __webpack_require__.e = (moduleId: string) => {
                const link = document.createElement('link');
                link.rel = 'modulepreload';
                link.href = moduleMap[moduleId];

                document.head.appendChild(link);

                return originalE(moduleId);
            };
        },
        multi: true,
    };
}
