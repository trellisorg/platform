import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { CHUNK_REGEX } from './constants';

/**
 * Global webpack variable that is available during SSR when Angular is being rendered by Universal. We know this exists
 * so we define it (although it's very hacky)
 */
declare const __webpack_require__: {
    e: (moduleId: string) => unknown;
    moduleContentMap: Map<string, string>;
};

__webpack_require__.moduleContentMap = new Map<string, string>();

export const webpackRequire = __webpack_require__;

export function readModuleContent(srcPath: string, pathToBrowserFiles: string): string {
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
export function readChunkMap(pathToBrowserFiles: string): Record<string, string> {
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

export function _serializeImportMap(document: Document, importMapChunks: Map<string, string>): () => void {
    return () => {
        const script = document.createElement('script');
        script.type = 'importmap';

        script.text = JSON.stringify({
            imports: Object.fromEntries(importMapChunks),
        });

        document.head.insertBefore(script, document.head.firstChild);
    };
}
