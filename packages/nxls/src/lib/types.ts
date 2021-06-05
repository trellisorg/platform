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

export interface FilterableCommand {
    buildable?: boolean;
    projectType?: 'app' | 'lib';
    frameworks?: Framework[];
}

export type Framework =
    | 'angular'
    | 'react'
    | 'node'
    | 'gatsby'
    | 'next'
    | 'web';

export const projectTypeMap = {
    app: 'application',
    lib: 'library',
};
