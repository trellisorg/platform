import type { Request, Response } from 'express';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const RUNTIME_REGEX = /^\/runtime([a-z0-9]*\.)+js$/;

let runtimeJSPath: string | undefined = undefined;

const createCallback = (distFolder: string) => (req: Request, res: Response) => {
    if (!runtimeJSPath) {
        runtimeJSPath = readdirSync(distFolder).find((fileName) => fileName.startsWith('runtime.'));
    }

    // 'script.src = __webpack_require__.tu(url);'

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let runtime = readFileSync(join(distFolder, runtimeJSPath!), { encoding: 'utf8' });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const src = new RegExp(/\.src\s?=\s?[_a-z0-9]*\.tu\([a-z]*\)/).exec(runtime)![0];

    const [, call] = src.split('=');

    runtime = runtime.replace(src, `.text=\`import './\${${call}}'\``);

    res.setHeader('content-type', 'application/javascript; charset=UTF-8');
    res.send(runtime);
};

/**
 * Utility function to patch the `runtime.js` file so that the application imports chunks using `import './chunk.js'`
 * instead of adding it to a script tags `src`. This requires the browser to support both Imports Maps and Modules.
 * @param distFolder
 */
export function overrideRuntime(distFolder: string): [RegExp, (req: Request, res: Response) => void] {
    return [RUNTIME_REGEX, createCallback(distFolder)];
}
