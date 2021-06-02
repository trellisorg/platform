import { ModuleMetadata } from '@nestjs/common/interfaces';
import {
    BaseSpectatorModuleMetadata,
    getSpectatorDefaultOptions,
} from './options';
import { TestingModuleBuilder } from '@nestjs/testing/testing-module.builder';
import { mockProvider } from './mock';
import { Test } from '@nestjs/testing';

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
