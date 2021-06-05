import { Dep, Dependencies } from './types';
import { readOrGenerateDepFile, uniqueArray } from './util';

function buildKey(path: string[]): string {
    return path.join(' -> ');
}

function processDependency(
    depsInPath: string[],
    currentTarget: string,
    deps: Dependencies,
    keyTracker: Set<string> = new Set<string>()
): { path: string[]; key: string }[] {
    const targetDeps = deps[currentTarget];

    if (targetDeps.length === 0) {
        return [];
    }

    for (const dep of targetDeps) {
        // if the dep already exists in the path don't add it and add path to circular deps
        if (dep.target === currentTarget) {
            const path = [currentTarget, dep.target];
            const key = buildKey(path);

            if (!keyTracker.has(key)) {
                keyTracker.add(key);
            }
        } else if (depsInPath.includes(dep.target)) {
            const index: number = depsInPath.findIndex((v) => v === dep.target);
            const values: string[] = depsInPath.slice(index);
            const circularPath: string[] = [...values, dep.target];

            // Add circular dep into the tracked circular deps array
            const key = buildKey(circularPath);
            if (!keyTracker.has(key)) {
                keyTracker.add(key);
            }
        } else {
            processDependency(
                [...depsInPath, dep.target],
                dep.target,
                deps,
                keyTracker
            );
        }
    }

    return [];
}

export function _findCircularDependencies(
    dependencies: Dependencies
): { path: string[]; key: string }[] {
    const allDependencies: [string, Dep[]][] = Object.entries(dependencies);

    const circularDeps: { path: string[]; key: string }[] = [];

    allDependencies
        .filter(([dep]) => !dep.startsWith('npm:'))
        .forEach(([name, dependency]) => {
            processDependency([name], name, dependencies);
        });

    return uniqueArray(circularDeps, (item) => item.key);
}

/**
 * Find all of the circular dependencies in the repo and print the shortest dependency chain between them.
 *
 * Example:
 *
 * If app1 imports lib1 and lib1 imports lib2 and lib2 imports lib1 only
 * lib1 -> lib2 -> lib1 will be printed, app1 will be left out as it is not part of the circular dependency
 */
export function findCircularDependencies(): { path: string[]; key: string }[] {
    const dependencies = readOrGenerateDepFile().dependencies;
    return _findCircularDependencies(dependencies);
}
