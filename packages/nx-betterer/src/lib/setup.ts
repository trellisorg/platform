import { ProjectGraphProjectNode, readJsonFile } from '@nx/devkit';
import { readCachedProjectGraph } from '@nx/workspace/src/core/project-graph';
import type { NxBettererContext, TsConfig } from './types';

/**
 * Reads the configurations files that will be used in multiple places throughout the tests
 */
export function setupNxBetterer(): NxBettererContext {
    const plainWorkspaceJson = readJsonFile<{ projects: Record<string, string | any> }>('workspace.json');

    const workspaceJson = readCachedProjectGraph();

    const workspaceProjects: ProjectGraphProjectNode[] = Object.entries(workspaceJson.nodes)
        .filter(([, node]) => !node.name.startsWith('npm:') && node.type !== 'e2e')
        .map(([, node]) => node as ProjectGraphProjectNode);

    const tsConfigBase = readJsonFile<TsConfig>('tsconfig.base.json');

    return {
        plainWorkspaceJson,
        workspaceJson,
        workspaceProjects,
        tsConfigBase,
    };
}
