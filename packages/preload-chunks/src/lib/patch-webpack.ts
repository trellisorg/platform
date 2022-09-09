import { DOCUMENT } from '@angular/common';
import { ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { readdirSync } from 'fs';
import { join } from 'path';

const CHUNK_REGEX = /^[0-9]*.[a-z0-9]*.js$/;

declare const __webpack_require__: { e: (moduleId: string) => unknown };

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
