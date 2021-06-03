import { Dependencies, NxDepsJson } from './types';

function checkDependency(
    depTree: NxDepsJson['dependencies'],
    currentSource: string,
    target: string,
    currentPath: string[],
    alreadyVisited = new Set<string>()
): string[][] {
    const chains: string[][] = [];

    const depsPath = [...currentPath, currentSource];

    if (alreadyVisited.has(currentSource)) {
        return [];
    }

    alreadyVisited.add(currentSource);

    depTree[currentSource].forEach((dep) => {
        if (dep.target === target) {
            chains.push([...depsPath, target]);
        } else {
            chains.push(
                ...checkDependency(
                    depTree,
                    dep.target,
                    target,
                    depsPath,
                    alreadyVisited
                )
            );
        }
    });

    return chains;
}

export function findDependencies(
    target: string,
    dependencies: Dependencies
): string[] {
    return Object.values(dependencies[target]).map((dep) => dep.target);
}

export function findDependents(
    target: string,
    dependencies: Dependencies
): string[] {
    return Object.entries(dependencies).reduce((prev, [project, deps]) => {
        if (deps.find((dep) => dep.target === target)) {
            return [project, ...prev];
        }

        return prev;
    }, []);
}

export function findAllDependencyChains(
    sources: string[],
    target: string,
    dependencies: Dependencies
): string[][] {
    return sources
        .map((source) => checkDependency(dependencies, source, target, []))
        .flat();
}
