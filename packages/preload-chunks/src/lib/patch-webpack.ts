import { DOCUMENT } from '@angular/common';
import { ENVIRONMENT_INITIALIZER, inject, Provider } from '@angular/core';
import { BEFORE_APP_SERIALIZED } from '@angular/platform-server';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import type { PreloadChunksConfig } from './config';
import { CHUNK_REGEX, IMPORT_MAP_CHUNKS } from './constants';

/**
 * Global webpack variable that is available during SSR when Angular is being rendered by Universal. We know this exists
 * so we define it (although it's very hacky)
 */
declare const __webpack_require__: {
    e: (moduleId: string) => unknown;
    moduleContentMap: Map<string, string>;
};

__webpack_require__.moduleContentMap = new Map<string, string>();

function readModuleContent(srcPath: string, pathToBrowserFiles: string): string {
    const cache = __webpack_require__.moduleContentMap.get(srcPath);

    if (cache) {
        return cache;
    }

    const content = `data:text/javascript;charset=utf-8,${readFileSync(join(pathToBrowserFiles, srcPath), {
        encoding: 'utf8',
    })}`;

    __webpack_require__.moduleContentMap.set(srcPath, content);

    return content;
}

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

function _serializeImportMap(document: Document, importMapChunks: Map<string, string>): () => void {
    return () => {
        const script = document.createElement('script');
        script.type = 'importmap';

        script.text = JSON.stringify({
            imports: Object.fromEntries(importMapChunks),
        });

        document.head.insertBefore(script, document.head.firstChild);
    };
}

/**
 * A provider function to be used within the server so that any lazy chunk that is loaded and thus needed to render
 * the page that is sent to the client will have a `<link rel="modulepreload" href="<chunk path>">` tag in the SSR'd
 * documents `<head>`
 *
 * @param pathToBrowserFiles
 * @param config
 */
export function provideChunkPreloader({ pathToBrowserFiles, config }: PreloadChunksConfig): Provider[] {
    const moduleMap = readChunkMap(pathToBrowserFiles);

    const useLinkPreload = config == null || config.type === 'link';

    return [
        {
            provide: IMPORT_MAP_CHUNKS,
            useValue: new Map<string, string>(),
        },
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue() {
                const document = inject(DOCUMENT);
                const importMapChunks = inject(IMPORT_MAP_CHUNKS);

                const originalE = __webpack_require__.e;

                if (!useLinkPreload) {
                    const beforeAppSerialized = inject(BEFORE_APP_SERIALIZED);

                    beforeAppSerialized.push(_serializeImportMap(document, importMapChunks));
                }

                let preloadCount = 0;

                __webpack_require__.e = (moduleId: string) => {
                    const srcPath = moduleMap[moduleId];

                    if (config?.max == null || preloadCount < config.max) {
                        if (useLinkPreload) {
                            const link = document.createElement('link');
                            link.rel = 'modulepreload';
                            link.href = srcPath;

                            document.head.appendChild(link);
                        } else {
                            importMapChunks.set(`./${srcPath}`, readModuleContent(srcPath, pathToBrowserFiles));
                        }
                    }

                    preloadCount += 1;

                    return originalE(moduleId);
                };
            },
            multi: true,
        },
    ];
}
