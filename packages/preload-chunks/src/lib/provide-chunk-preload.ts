import { DOCUMENT } from '@angular/common';
import { ENVIRONMENT_INITIALIZER, inject, Provider } from '@angular/core';
import { BEFORE_APP_SERIALIZED } from '@angular/platform-server';
import type { PreloadChunksConfig } from './config';
import { IMPORT_MAP_CHUNKS } from './constants';
import { readChunkMap, readModuleContent, webpackRequire, _serializeImportMap } from './patch-webpack';

/**
 * A provider function to be used within the server so that any lazy chunk that is loaded and thus needed to render
 * the page that is sent to the client will have a `<link rel="modulepreload" href="<chunk path>">` tag in the SSR'd
 * documents `<head>`
 *
 * @param pathToBrowserFiles
 * @param config
 * @param enabled
 */
export function provideChunkPreloader({ pathToBrowserFiles, config, enabled = true }: PreloadChunksConfig): Provider[] {
    if (!enabled) {
        return [];
    }

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

                const originalE = webpackRequire.e;

                if (!useLinkPreload) {
                    const beforeAppSerialized = inject(BEFORE_APP_SERIALIZED);

                    beforeAppSerialized.push(_serializeImportMap(document, importMapChunks));
                }

                let preloadCount = 0;

                webpackRequire.e = (moduleId: string) => {
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
