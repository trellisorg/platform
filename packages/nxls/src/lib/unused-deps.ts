import type { ProjectGraphProjectNode } from '@nrwl/devkit';
import { createProjectGraphAsync } from '@nrwl/devkit';
import type { Dependencies, FilterableCommand } from './types';
import { filterDependencyGraph, filterProjects } from './util';

export interface FindUnusedConfig extends FilterableCommand {
    excludeExternal?: boolean;
}

export function _findUnusedDependencies(
    dependencies: Dependencies,
    projects: Record<string, ProjectGraphProjectNode>,
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
            if (!usedDeps.has(project) && projects[project]?.type !== 'app') {
                unusedDeps.add(project);
            }
        });

    return [...unusedDeps];
}

export async function findUnusedDependencies(
    config: FindUnusedConfig
): Promise<string[]> {
    const projectGraph = await createProjectGraphAsync();

    return _findUnusedDependencies(
        projectGraph.dependencies,
        projectGraph.nodes,
        config
    );
}
