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

function serverlessSharpImageLoader(config: ServerlessSharpLoaderConfig): ImageLoader {
    return (imageLoaderConfig: ImageLoaderConfig): string => {
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

        return assetUrl.toString();
    };
}

export function provideServerlessSharpLoader(config: ServerlessSharpLoaderConfig): Provider[] {
    return [
        {
            provide: SERVERLESS_SHARP_LOADER_CONFIG,
            useValue: config,
        },
        {
            provide: IMAGE_LOADER,
            useFactory: (): ImageLoader => {
                const parentConfig = inject(SERVERLESS_SHARP_LOADER_CONFIG, { optional: true });

                const document = inject(DOCUMENT);

                const isServer = isPlatformServer(inject(PLATFORM_ID));

                const mergedConfig: ServerlessSharpLoaderConfig = {
                    ...(parentConfig ?? {}),
                    ...config,
                    parameters: {
                        ...(parentConfig?.parameters ?? {}),
                        ...(config.parameters ?? {}),
                    },
                };

                return (imageConfig: ImageLoaderConfig) => {
                    const urlCreator = serverlessSharpImageLoader(mergedConfig);

                    const url = urlCreator(imageConfig);

                    if (isServer) {
                        const urlId = url;

                        const preload = document.createElement('link');
                        preload.setAttribute('fetchpriority', 'high');
                        preload.href = url;
                        preload.as = 'image';
                        preload.type = 'image/webp';
                        preload.id = urlId;

                        document.head.appendChild(preload);
                    }

                    return url;
                };
            },
        },
    ];
}
