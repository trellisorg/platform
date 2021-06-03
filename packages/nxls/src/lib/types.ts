export interface Dep {
    type: string;
    source: string;
    target: string;
}

export type Dependencies = Record<string, Dep[]>;

export interface NxDepGraph {
    graph: {
        dependencies: Dependencies;
    };
}

export interface NxDepsJson {
    dependencies: Dependencies;
}
