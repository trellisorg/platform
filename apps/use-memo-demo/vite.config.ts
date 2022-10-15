import angular from '@analogjs/vite-plugin-angular';
import { offsetFromRoot } from '@nrwl/devkit';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    root: 'src',
    server: {
        port: 3000,
    },
    build: {
        outDir: `${offsetFromRoot('apps/use-memo-demo/src')}/dist/apps/use-memo-demo`,
        emptyOutDir: true,
        target: 'es2020',
        rollupOptions: {
            external: [/ngResource/],
            onwarn: (warning, warn) => {
                if (warning.message.includes('ngResource')) {
                    return;
                }
                warn(warning);
            },
        },
    },
    resolve: {
        mainFields: ['module'],
    },
    plugins: [
        angular({
            inlineStylesExtension: 'scss',
        }),
        visualizer() as Plugin,
        splitVendorChunkPlugin(),
    ],
    define: {
        'import.meta.vitest': mode !== 'production',
    },
}));
