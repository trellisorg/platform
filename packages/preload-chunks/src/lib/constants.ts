import { InjectionToken } from '@angular/core';

/**
 * Matches chunks created by the Angular CLI.
 */
export const CHUNK_REGEX = /^[0-9\-_]*.[a-z0-9\-_]*.js$/;

export const IMPORT_MAP_CHUNKS = new InjectionToken<Map<string, string>>(
    '[@trellisorg/preload-chunks] import map chunks'
);
