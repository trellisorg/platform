import type { ProjectConfiguration } from '@nrwl/tao/src/shared/workspace';
import { readWorkspaceJson } from '@nrwl/workspace';
import type { Dependencies } from './types';
import { readOrGenerateDepFile } from './util';

export interface FindUnusedConfig {
    excludeExternal?: boolean;
}

export function _findUnusedDependencies(
    dependencies: Dependencies,
    projects: Record<string, ProjectConfiguration>,
    { excludeExternal }: FindUnusedConfig
): string[] {
    const usedDeps = new Set<string>();

    Object.values(dependencies).forEach((deps) => {
        deps.forEach((dep) => {
            usedDeps.add(dep.target);
        });
    });

    const unusedDeps = new Set<string>();

    Object.keys(dependencies)
        .filter((project) =>
            excludeExternal ? !project.startsWith('npm:') : true
        )
        .forEach((project) => {
            if (
                !usedDeps.has(project) &&
                projects[project]?.projectType !== 'application'
            ) {
                unusedDeps.add(project);
            }
        });

    return [...unusedDeps];
}

export function findUnusedDependencies(config: FindUnusedConfig): string[] {
    const nxDepsFile = readOrGenerateDepFile();

    const workspaceJson = readWorkspaceJson();

    return _findUnusedDependencies(
        nxDepsFile.dependencies,
        workspaceJson.projects,
        config
    );
}
