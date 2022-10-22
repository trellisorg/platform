export interface SharedConfig {
    max?: number;
}

export interface LinkPreloadConfig extends SharedConfig {
    type: 'link';
}

export interface ImportMapConfig extends SharedConfig {
    type: 'importMap';
}

export interface PreloadChunksConfig {
    pathToBrowserFiles: string;
    config?: LinkPreloadConfig | ImportMapConfig;
}
