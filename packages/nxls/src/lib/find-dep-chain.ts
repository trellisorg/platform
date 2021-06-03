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

export function findAllDependencyChains(
    sources: string[],
    target: string,
    dependencies: Dependencies
): string[][] {
    return sources
        .map((source) => checkDependency(dependencies, source, target, []))
        .flat();
}
