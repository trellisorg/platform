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

    // If npm dependency then there is not a node, and we want to skip adding
    // it to alreadyVisited as we'd like to visit the target npm node again.
    if(currentSource.startsWith('npm:')) {
        if(currentSource.split('npm:')[1] === target) {
            chains.push([...depsPath])
        } else {
            // We don't need to visit this npm node again, it's not our target.
            alreadyVisited.add(currentSource);
        }
        return chains;
    }

    alreadyVisited.add(currentSource);

    const node = depTree[currentSource];

    /*
     Npm dependencies don't have a node in the depTree so the index may be
     undefined.
    */
    if(node) {
        node.forEach((dep) => {
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
    }

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
