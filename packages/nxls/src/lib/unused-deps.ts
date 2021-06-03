import { Dependencies } from './types';
import { ProjectConfiguration } from '@nrwl/tao/src/shared/workspace';

export function findUnusedDependencies(
    dependencies: Dependencies,
    projects: Record<string, ProjectConfiguration>,
    excludeExternal: boolean
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
