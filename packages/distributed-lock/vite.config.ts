/// <reference types='vitest' />
import { defineConfig } from 'vite';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/distributed-lock',
    plugins: [nxViteTsPaths()],
    test: {
        globals: true,
        cache: {
            dir: '../../node_modules/.vitest',
        },
        environment: 'jsdom',
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

        reporters: ['default'],
        coverage: {
            reportsDirectory: '../../coverage/packages/distributed-lock',
            provider: 'v8',
        },
    },
});
