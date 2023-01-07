import { ProjectGraphProjectNode, readJsonFile } from '@nrwl/devkit';
import { join } from 'path';
import type { TsConfig } from './types';

export const tsConfigCache = new Map<string, TsConfig>();

/**
 * Read the TSConfig for a project or read it from cache if it's already been read once.
 * @param path
 */
export function readTsConfig(path: string): TsConfig | undefined {
    if (tsConfigCache.has(path)) {
        return tsConfigCache.get(path);
    }

    const tsConfig = readJsonFile<TsConfig>(path);

    tsConfigCache.set(path, tsConfig);

    return tsConfig;
}

/**
 * Check if a compiler flag is enabled for a project, will look to see if it is set in the following order:
 *
 * 1. libs tsconfig.lib.json
 * 2. libs tsconfig.json
 * 3. tsconfig.base.json
 * @param tsConfigBase
 * @param project
 * @param flag
 * @param value
 * @param type
 */
export function isCompilerFlagSet(
    tsConfigBase: TsConfig,
    project: ProjectGraphProjectNode,
    flag: keyof TsConfig['compilerOptions'],
    value: boolean,
    type: 'lib' | 'app' | 'spec' | 'e2e'
): boolean {
    const rootFlagSet = tsConfigBase.compilerOptions?.[flag];

    const tsConfigLibJson = readTsConfig(join(project.data.root, `tsconfig.${type}.json`));
    const tsConfigJson = readTsConfig(join(project.data.root, 'tsconfig.json'));

    const libFlagSet = tsConfigLibJson?.compilerOptions?.[flag];
    const projectFlagSet = tsConfigJson?.compilerOptions?.[flag];

    return (
        libFlagSet === value ||
        (projectFlagSet === value && libFlagSet === undefined) ||
        (rootFlagSet === value && projectFlagSet === undefined)
    );
}

/**
 * Check if the library is buildable or not.
 * @param project
 */
export function isBuildable(project: ProjectGraphProjectNode): boolean {
    return !!project.data.targets?.['build'];
}
