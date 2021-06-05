import type { Dependencies, NxDepsJson } from './types';
import { readOrGenerateDepFile } from './util';

export interface FindDependencyConfig {
    target: string;
}

export interface FindDependencyChainConfig extends FindDependencyConfig {
    source: string[];
}

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

export function findDependencies({ target }: FindDependencyConfig): string[] {
    const dependencies = readOrGenerateDepFile().dependencies;
    return Object.values(dependencies[target]).map((dep) => dep.target);
}

export function findDependents({ target }: FindDependencyConfig): string[] {
    const dependencies = readOrGenerateDepFile().dependencies;
    return Object.entries(dependencies).reduce((prev, [project, deps]) => {
        if (deps.find((dep) => dep.target === target)) {
            return [project, ...prev];
        }

        return prev;
    }, []);
}

export function findAllDependencyChains({
    source,
    target,
}: FindDependencyChainConfig): string[][] {
    const dependencies = readOrGenerateDepFile().dependencies;
    return _findAllDependencyChains({ source, target }, dependencies);
}

export function _findAllDependencyChains(
    { source, target }: FindDependencyChainConfig,
    dependencies: Dependencies
): string[][] {
    return source
        .map((source) => checkDependency(dependencies, source, target, []))
        .flat();
}
