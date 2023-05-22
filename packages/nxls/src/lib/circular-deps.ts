import type { ProjectGraph } from '@nx/devkit';
import { createProjectGraphAsync } from '@nx/devkit';
import type { Dep, Dependencies, FilterableCommand } from './types';
import { filterDependencyGraph, filterProjects, uniqueArray } from './util';

function buildKey(path: string[]): string {
    return path.join(' -> ');
}

function processDependency(
    depsInPath: string[],
    currentTarget: string,
    deps: Dependencies,
    circularDeps: Map<string, { path: string[]; key: string }>,
    nodesVisited: Set<string>
): void {
    const targetsDependencies = deps[currentTarget];

    if (!targetsDependencies || targetsDependencies.length === 0) {
        return;
    }

    for (const dep of targetsDependencies) {
        // if the dep already exists in the path don't add it and add path to circular deps
        if (depsInPath.includes(dep.target)) {
            const index = depsInPath.findIndex((v) => v === dep.target);
            const values = depsInPath.slice(index);
            const path = [...values, dep.target];
            const key = buildKey(path);
            if (!circularDeps.has(key)) console.log('Found a new circular dep, ', key);
            circularDeps.set(key, { path, key });
        } else {
            processDependency([...depsInPath, dep.target], dep.target, deps, circularDeps, nodesVisited);
        }

        nodesVisited.add(dep.target);
    }
}

export function _findCircularDependencies(
    config: FilterableCommand,
    projectGraph: ProjectGraph
): { path: string[]; key: string }[] {
    const allDependencies: [string, Dep[]][] = Object.entries(
        filterDependencyGraph(projectGraph.dependencies, filterProjects(config, projectGraph.nodes))
    );

    const circularDeps = new Map<string, { key: string; path: string[] }>();

    const nodesVisited = new Set<string>();

    allDependencies
        .filter(([dep]) => !dep.startsWith('npm:'))
        .forEach(([name], index) => {
            if (!nodesVisited.has(name)) {
                console.log(`Processing top level dep number ${index} - ${name}`);
                processDependency([name], name, projectGraph.dependencies, circularDeps, nodesVisited);
            } else {
                console.log(`Top level dep ${name} already visited, no need to step into.`);
            }
        });

    return uniqueArray(
        Array.from(circularDeps.entries()).map(([, value]) => value),
        (item) => item.key
    );
}

/**
 * Find all of the circular dependencies in the repo and print the shortest dependency chain between them.
 *
 * Example:
 *
 * If app1 imports lib1 and lib1 imports lib2 and lib2 imports lib1 only
 * lib1 -> lib2 -> lib1 will be printed, app1 will be left out as it is not part of the circular dependency
 */
export async function findCircularDependencies(config: FilterableCommand): Promise<{ path: string[]; key: string }[]> {
    const projectGraph = await createProjectGraphAsync();

    return _findCircularDependencies(config, projectGraph);
}
