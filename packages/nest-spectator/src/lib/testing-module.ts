import type { ModuleMetadata } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import type { TestingModuleBuilder } from '@nestjs/testing/testing-module.builder';
import { mockProvider } from './mock';
import {
    BaseSpectatorModuleMetadata,
    getSpectatorDefaultOptions,
} from './options';

export function createTestingModuleFactory(
    metadata: BaseSpectatorModuleMetadata
): TestingModuleBuilder {
    const options = getSpectatorDefaultOptions(metadata);

    const moduleMetadata: ModuleMetadata = {
        imports: options.imports,
        controllers: options.controllers,
        providers: [
            ...options.providers,
            ...options.mocks.map((mock) => mockProvider(mock)),
        ],
        exports: options.exports,
    };

    return Test.createTestingModule(moduleMetadata);
}
