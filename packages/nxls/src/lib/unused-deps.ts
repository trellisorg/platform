import type { ProjectConfiguration } from '@nrwl/tao/src/shared/workspace';
import { readWorkspaceJson } from '@nrwl/workspace';
import type { Dependencies, FilterableCommand } from './types';
import {
    filterDependencyGraph,
    filterProjects,
    readOrGenerateDepFile,
} from './util';

export interface FindUnusedConfig extends FilterableCommand {
    excludeExternal?: boolean;
}

export function _findUnusedDependencies(
    dependencies: Dependencies,
    projects: Record<string, ProjectConfiguration>,
    config: FindUnusedConfig
): string[] {
    const filteredProjects = filterProjects(config, projects);

    const filteredDependencies: Dependencies = filterDependencyGraph(
        dependencies,
        filteredProjects
    );

    const usedDeps = new Set<string>();

    Object.values(filteredDependencies).forEach((deps) => {
        deps.forEach((dep) => {
            usedDeps.add(dep.target);
        });
    });

    const unusedDeps = new Set<string>();

    Object.keys(filteredDependencies)
        .filter((project) =>
            config.excludeExternal ? !project.startsWith('npm:') : true
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
