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
