import { readJsonFile } from '@nrwl/devkit';
import { readWorkspace } from '@nrwl/devkit/src/generators/project-configuration';
import { FsTree } from '@nrwl/tao/src/shared/tree';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import type { NxBettererContext, TsConfig } from './types';

/**
 * Copy from @nrwl/nx
 * https://github.com/nrwl/nx/blob/master/packages/tao/index.ts#L82-L94
 */
function findWorkspaceRoot(dir: string): string {
    if (dirname(dir) === dir) {
        throw new Error(`The cwd isn't part of an Nx workspace`);
    }
    if (
        existsSync(join(dir, 'angular.json')) ||
        existsSync(join(dir, 'workspace.json'))
    ) {
        return dir;
    }
    return findWorkspaceRoot(dirname(dir));
}

/**
 * Reads the configurations files that will be used in multiple places throughout the tests
 */
export function setupNxBetterer(): NxBettererContext {
    const root = findWorkspaceRoot(process.cwd());
    const tree = new FsTree(root, false);
    const plainWorkspaceJson = readWorkspace(tree);

    const workspaceProjects = Object.keys(plainWorkspaceJson.projects).map(
        (projectName) => plainWorkspaceJson.projects[projectName]
    );

    const tsConfigBase = readJsonFile<TsConfig>('tsconfig.base.json');

    return {
        plainWorkspaceJson,
        workspaceProjects,
        tsConfigBase,
    };
}
