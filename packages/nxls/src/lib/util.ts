import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { NxDepGraph, NxDepsJson } from './types';

const DEP_GRAPH_FILE = './tmp/dep-graph.json';
const NX_DEP_FILE = './node_modules/.cache/nx/nxdeps.json';

export function readNxDepsFile(): NxDepsJson {
    return JSON.parse(readFileSync(NX_DEP_FILE).toString());
}

export function readNxDepGraph(): NxDepGraph {
    return JSON.parse(readFileSync(DEP_GRAPH_FILE).toString());
}

export function generateDepGraph(): void {
    console.log(`Generating Dependency graph...`);
    execSync(`nx dep-graph --file=${DEP_GRAPH_FILE}`);
    console.log(`Completed Generation of Dependency graph!`);
}

export function readOrGenerateDepFile(): NxDepsJson {
    generateDepGraph();

    return readNxDepsFile();
}

/**
 * Calculates how many deps the outer array has from the inner array
 * assumes outer is larger than inner
 * @param outerDeps
 * @param innerDeps
 */
export function percentSubSet(
    outerDeps: string[],
    innerDeps: string[]
): number {
    let count = 0;

    innerDeps.forEach((dep) => {
        if (outerDeps.includes(dep)) count++;
    });

    return count / outerDeps.length;
}

export function uniqueArray<T>(arr: T[], checker: (item: T) => string): T[] {
    const found = new Map<string, T>();

    return arr.filter((item) => {
        const key = checker(item);
        if (found.has(key)) {
            return false;
        }

        found.set(key, item);

        return true;
    });
}
