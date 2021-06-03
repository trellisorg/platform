import { NxDepGraph, NxDepsJson } from './types';
import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

const DEP_GRAPH_FILE = './tmp/dep-graph.json';
const NX_DEP_FILE = './node_modules/.cache/nx/nxdeps.json';

export function readNxDepGraph(): NxDepGraph {
    return JSON.parse(readFileSync(DEP_GRAPH_FILE).toString());
}

export function readNxDepsFile(): NxDepsJson {
    return JSON.parse(readFileSync(NX_DEP_FILE).toString());
}

export function generateDepGraph(): void {
    console.log(`Generating Dependency graph...`);
    execSync(`nx dep-graph --file=${DEP_GRAPH_FILE}`);
    console.log(`Completed Generation of Dependency graph!`);
}

export function readOrGenerateDepGraph(): NxDepGraph {
    if (existsSync(DEP_GRAPH_FILE)) {
        console.log(
            'Dependency graph already exists, reusing already generated graph.'
        );
        return readNxDepGraph();
    }

    generateDepGraph();

    return readNxDepGraph();
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
