import type { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { merge } from './internal/merge';
import type { OptionalsRequired } from './types';

export interface BaseSpectatorModuleMetadata extends ModuleMetadata {
    mocks?: Type<any>[];
}

const defaultOptions: OptionalsRequired<BaseSpectatorModuleMetadata> = {
    imports: [],
    controllers: [],
    providers: [],
    exports: [],
    mocks: [],
};

/**
 * @internal
 */
export function getSpectatorDefaultOptions<C>(
    overrides?: BaseSpectatorModuleMetadata
): Required<BaseSpectatorModuleMetadata> {
    return merge(defaultOptions, overrides);
}
