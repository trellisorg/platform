import { ModuleMetadata, Provider, Type } from '@nestjs/common/interfaces';
import { OptionalsRequired } from './types';
import { merge } from './internal/merge';

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
