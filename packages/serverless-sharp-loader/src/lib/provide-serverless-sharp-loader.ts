import { DOCUMENT, ImageLoader, ImageLoaderConfig, IMAGE_LOADER, isPlatformServer } from '@angular/common';
import type { Provider } from '@angular/core';
import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import md5 from 'md5';

/**
 * Configuration token for the library so that the config can be stored in the injector and merged throughout the tree
 * to support using different values in different parts of your application.
 */
export const SERVERLESS_SHARP_LOADER_CONFIG = new InjectionToken<ServerlessSharpLoaderConfig>(
    'serverless-sharp-loader-config'
);

/**
 * {@link https://venveo.github.io/serverless-sharp/index.html#/usage/parameters}
 */
export interface ServerlessSharpLoaderConfig {
    parameters?: {
        fm?: 'webp' | 'png' | 'jpeg' | 'tiff';
        q?: number;
        ar?: string;
        dpr?: number;
        fit?: 'fill' | 'scale' | 'crop' | 'clip' | 'min' | 'max';
        ['fill-color']?: string;
        crop?: 'focalpoint' | 'entropy' | 'top,left' | 'bottom,right';
        ['fp-x']?: number;
        ['fp-y']?: number;
        s?: string;
        auto?: 'compress' | 'format' | 'compress,format';
        blur?: number;
    };
    /**
     * The Cloudfront Distribution URL
     */
    baseUrl: string;
}

/**
 * Will hash and configure the security parameter if enabled within your distribution
 * @param assetUrl
 * @param securityKey
 */
function configureSecurity(assetUrl: URL, securityKey: string): string {
    return md5(`${securityKey}${assetUrl.pathname}?${assetUrl.searchParams.toString()}`);
}

function serverlessSharpImageLoader(config: ServerlessSharpLoaderConfig) {
    return (imageLoaderConfig: ImageLoaderConfig) => {
        const srcUrl = new URL(imageLoaderConfig.src, config.baseUrl);

        const assetUrl = new URL(srcUrl.pathname, config.baseUrl);

        Object.entries(config.parameters ?? {}).forEach(([parameter, value]) => {
            if (value) {
                if (parameter !== 's') {
                    // handle security separately
                    assetUrl.searchParams.set(parameter, value.toString());
                }
            }
        });

        if (imageLoaderConfig.width) {
            assetUrl.searchParams.set('w', imageLoaderConfig.width.toString());
        }

        if (config.parameters?.s) {
            assetUrl.searchParams.set('s', configureSecurity(assetUrl, config.parameters.s));
        }

        return {
            src: assetUrl.toString(),
            preload: srcUrl.hash === '#preload',
        };
    };
}

function mergeConfigs(
    config: ServerlessSharpLoaderConfig,
    parentConfig: ServerlessSharpLoaderConfig | null
): ServerlessSharpLoaderConfig {
    return {
        ...(parentConfig ?? {}),
        ...config,
        parameters: {
            ...(parentConfig?.parameters ?? {}),
            ...(config.parameters ?? {}),
        },
    };
}

/**
 * Construct the `<link>` tag that will be added to the `<head>` while rendering in the server. This will add the
 * necessary properties to the link tag so that the images are preloaded
 * @param url
 * @param document
 */
function createLinkTag(url: string, document: Document): void {
    const preload = document.createElement('link');
    preload.setAttribute('fetchpriority', 'high');
    preload.setAttribute('as', 'image');
    preload.href = url;
    preload.rel = 'preload';

    document.head.appendChild(preload);
}

function injectLoaderProviders() {
    return {
        document: inject(DOCUMENT),
        isServer: isPlatformServer(inject(PLATFORM_ID)),
        config: inject(SERVERLESS_SHARP_LOADER_CONFIG),
    };
}

export function provideServerlessSharpLoader(config: ServerlessSharpLoaderConfig): Provider[] {
    return [
        {
            provide: SERVERLESS_SHARP_LOADER_CONFIG,
            useFactory: () =>
                mergeConfigs(
                    config,
                    inject(SERVERLESS_SHARP_LOADER_CONFIG, {
                        optional: true,
                        skipSelf: true,
                    })
                ),
        },
        {
            provide: IMAGE_LOADER,
            useFactory: (): ImageLoader => {
                const { config, document, isServer } = injectLoaderProviders();

                /*
                Currently building the `ImageLoader` functionally manually but once
                [this PR](https://github.com/angular/angular/pull/47340) is merged then we can use the `createImageLoader`
                function to ensure that the right validations are happening on the `<img>` tag.
                 */
                return (imageConfig: ImageLoaderConfig) => {
                    const urlCreator = serverlessSharpImageLoader(config);

                    const { src, preload } = urlCreator(imageConfig);

                    /*
                    This is not entirely optimal because it will create a link tag in the server for every img
                    that is rendered using the `NgOptimizedImage` directive.

                    This will be resolved (and this code can be removed) when/if this PR is merged into `@angular/common`

                    https://github.com/angular/angular/pull/47343

                    Additionally, as of v14.2.0 the `NgOptimizedImage` while in dev mode does some additional checks,
                    one of which checks to see if there are preconnect links for images. This check uses `document`
                    directly rather than injecting the `DOCUMENT` token which is SSR safe.

                    https://github.com/angular/angular/pull/47353
                     */
                    if (isServer && preload) {
                        createLinkTag(src, document);
                    }

                    return src;
                };
            },
        },
    ];
}
