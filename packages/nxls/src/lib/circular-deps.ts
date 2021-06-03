import { Dep, Dependencies, NxDepGraph } from './types';

function buildKey(path: string[]): string {
    return path.join(' -> ');
}

function processDependency(
    pathTillNow: string[],
    currentDepName: string,
    deps: Dependencies
): { path: string[]; key: string }[] {
    const circularDeps: { path: string[]; key: string }[] = [];

    const currentDep = deps[currentDepName];

    if (currentDep.length === 0) {
        return [];
    }

    for (const dep of currentDep) {
        // if the dep already exists in the path don't add it and add path to circular deps
        if (dep.target === currentDepName) {
            const path = [currentDepName, dep.target];
            circularDeps.push({ path, key: buildKey(path) });
        } else if (pathTillNow.includes(dep.target)) {
            const index: number = pathTillNow.findIndex(
                (v) => v === dep.target
            );
            const values: string[] = pathTillNow.slice(index);
            const circularPath: string[] = [
                ...values,
                currentDepName,
                dep.target,
            ];

            // Add circular dep into the tracked circular deps array
            circularDeps.push({
                path: circularPath,
                key: buildKey(circularPath),
            });
        } else {
            circularDeps.push(
                ...processDependency(
                    [...pathTillNow, currentDepName],
                    dep.target,
                    deps
                )
            );
        }
    }

    return circularDeps;
}

export function findCircularDependencies(dependencies: Dependencies): string[] {
    const allDependencies: [string, Dep[]][] = Object.entries(dependencies);

    const circularDeps: { path: string[]; key: string }[] = [];

    allDependencies.forEach(([name, dependency]) => {
        circularDeps.push(...processDependency([], name, dependencies));
    });

    return [...new Set<string>(circularDeps.map((dep) => dep.key))];
}
